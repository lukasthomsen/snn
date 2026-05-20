import { promises as fs } from "node:fs";
import * as path from "node:path";

import { expect, test, type Page, type Response, type TestInfo } from "@playwright/test";
import authState from "../../tools/perf/auth-state.cjs";

type PerfAuthCookie = {
  domain: string;
  expires: number;
  httpOnly: boolean;
  name: string;
  path: string;
  sameSite: "Lax" | "None" | "Strict";
  secure: boolean;
  value: string;
};

const { createPerfAuthCookies } = authState as {
  createPerfAuthCookies: (options?: {
    authBaseUrl?: string | undefined;
    baseUrl?: string | undefined;
    email?: string | undefined;
    repoRoot?: string | undefined;
  }) => Promise<{
    cookies: PerfAuthCookie[];
    token: string;
  }>;
};

type AuthState = "guest" | "signed-in";
type CacheState = "cold" | "warm";
type MeasurementKind = "action" | "route";
type MeasurementStatus = "error" | "ok";

type BrowserTelemetry = {
  cls?: number | undefined;
  decodedBodySizeBytes?: number | undefined;
  domContentLoadedMs?: number | undefined;
  encodedBodySizeBytes?: number | undefined;
  fcpMs?: number | undefined;
  finalUrl?: string | undefined;
  lcpMs?: number | undefined;
  loadEventMs?: number | undefined;
  resourceCount?: number | undefined;
  transferSizeBytes?: number | undefined;
  ttfbMs?: number | undefined;
};

type Measurement = BrowserTelemetry & {
  authState: AuthState;
  baseUrl: string;
  cacheControl?: string | undefined;
  cacheState?: CacheState | undefined;
  cfCacheStatus?: string | undefined;
  device: string;
  durationMs: number;
  environment: string;
  error?: string | undefined;
  httpStatus?: number | undefined;
  kind: MeasurementKind;
  locale: string;
  name: string;
  productSlug: string;
  project: string;
  repeatIndex: number;
  responseDurationMs?: number | undefined;
  runIndex: number;
  scenario: string;
  schemaVersion: 1;
  serverTraceName?: string | undefined;
  status: MeasurementStatus;
  target: string;
  timestamp: string;
  url?: string | undefined;
  xVercelCache?: string | undefined;
};

type MeasureInput = {
  authState: AuthState;
  cacheState?: CacheState | undefined;
  kind: MeasurementKind;
  name: string;
  page: Page;
  scenario: string;
  serverTraceName?: string | undefined;
  target: string;
};

const locale = process.env.PERF_LOCALE ?? "da";
const baseUrl = (process.env.PERF_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const productSlug = process.env.PERF_PRODUCT_SLUG ?? "essential-creatine-monohydrate";
const customerEmail = process.env.PERF_CUSTOMER_EMAIL;
const customerPassword = process.env.PERF_CUSTOMER_PASSWORD;
const authBaseUrl = (process.env.PERF_AUTH_BASE_URL ?? "http://localhost:3002").replace(/\/$/, "");
const measurementFile = path.join("perf-reports", "playwright", "measurements.ndjson");
const environment = process.env.PERF_ENVIRONMENT
  ?? (baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")
    ? "local"
    : baseUrl.includes("vercel.app")
      ? "preview"
      : "production-smoke");

const publicRoutes = [
  {
    name: "route.public.home",
    route: `/${locale}`,
    scenario: "public.home",
    serverTraceName: undefined,
    surface: "home",
  },
  {
    name: "route.public.catalog",
    route: `/${locale}/products`,
    scenario: "public.catalog",
    serverTraceName: "storefront.catalog.productCards.cached",
    surface: "catalog",
  },
  {
    name: "route.public.catalog.filtered",
    route: `/${locale}/products?sort=newest`,
    scenario: "public.catalog.filtered",
    serverTraceName: "storefront.catalog.productCards.cached",
    surface: "catalog",
  },
  {
    name: "route.public.productDetail",
    route: `/${locale}/products/${productSlug}`,
    scenario: "public.product-detail",
    serverTraceName: "storefront.catalog.productDetail",
    surface: "product-detail",
  },
  {
    name: "route.public.emptyCart",
    route: `/${locale}/cart`,
    scenario: "public.cart.empty",
    serverTraceName: "storefront.cart.loadExisting",
    surface: "cart-page",
  },
  {
    name: "route.public.checkoutEmptyRedirect",
    route: `/${locale}/checkout`,
    scenario: "public.checkout.empty-redirect",
    serverTraceName: "storefront.cart.loadExisting",
    surface: "cart-page",
  },
  {
    name: "route.public.wishlistSignedOut",
    route: `/${locale}/wishlist`,
    scenario: "public.wishlist.signed-out",
    serverTraceName: undefined,
    surface: "wishlist",
  },
] as const;

function roundDuration(durationMs: number) {
  return Math.round(durationMs * 10) / 10;
}

function getHeader(response: Response | null | undefined, name: string) {
  return response?.headers()[name.toLowerCase()];
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`.slice(0, 500);
  }

  return String(error).slice(0, 500);
}

function getResponseDurationMs(response: Response | null | undefined) {
  const timing = response?.request().timing();

  return typeof timing?.responseEnd === "number" && timing.responseEnd >= 0
    ? roundDuration(timing.responseEnd)
    : undefined;
}

function assertStripeTestPaymentPrep() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!secretKey?.startsWith("sk_test_") || !publishableKey?.startsWith("pk_test_")) {
    throw new Error(
      "PERF_CHECKOUT_PAYMENT_PREP=1 requires Stripe test keys: STRIPE_SECRET_KEY=sk_test_* and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_*.",
    );
  }
}

async function collectBrowserTelemetry(page: Page, response?: Response | null): Promise<BrowserTelemetry> {
  const timings = await page.evaluate(() => {
    const navigations = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    const navigation = navigations[navigations.length - 1];
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const paints = performance.getEntriesByType("paint") as PerformancePaintTiming[];
    const fcp = paints.find((entry) => entry.name === "first-contentful-paint");
    const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
    const lcp = lcpEntries[lcpEntries.length - 1] as PerformanceEntry | undefined;
    const layoutShiftEntries = performance.getEntriesByType("layout-shift") as Array<PerformanceEntry & {
      hadRecentInput?: boolean;
      value?: number;
    }>;
    const cls = layoutShiftEntries.reduce((sum, entry) => (
      entry.hadRecentInput ? sum : sum + (entry.value ?? 0)
    ), 0);

    return {
      cls,
      decodedBodySizeBytes: resources.reduce((sum, resource) => sum + resource.decodedBodySize, 0),
      domContentLoadedMs: navigation
        ? navigation.domContentLoadedEventEnd - navigation.startTime
        : undefined,
      encodedBodySizeBytes: resources.reduce((sum, resource) => sum + resource.encodedBodySize, 0),
      fcpMs: fcp?.startTime,
      finalUrl: window.location.href,
      lcpMs: lcp?.startTime,
      loadEventMs: navigation ? navigation.loadEventEnd - navigation.startTime : undefined,
      resourceCount: resources.length,
      transferSizeBytes: resources.reduce((sum, resource) => sum + resource.transferSize, 0),
      ttfbMs: navigation ? navigation.responseStart - navigation.requestStart : undefined,
    };
  }).catch(() => ({}));

  return {
    ...timings,
    finalUrl: timings.finalUrl ?? response?.url(),
  };
}

async function recordMeasurement(measurement: Measurement) {
  await fs.mkdir(path.dirname(measurementFile), { recursive: true });
  await fs.appendFile(measurementFile, `${JSON.stringify(measurement)}\n`);
}

async function measure<T>(
  testInfo: TestInfo,
  input: MeasureInput,
  operation: () => Promise<T>,
): Promise<T> {
  const startedAt = performance.now();
  let result: T | undefined;
  let response: Response | null | undefined;
  let status: MeasurementStatus = "ok";
  let errorMessage: string | undefined;

  try {
    result = await operation();

    if (result && typeof result === "object" && "headers" in result && "status" in result) {
      response = result as Response;
    }

    return result;
  } catch (error) {
    status = "error";
    errorMessage = normalizeError(error);

    throw error;
  } finally {
    const durationMs = roundDuration(performance.now() - startedAt);
    const telemetry = await collectBrowserTelemetry(input.page, response);

    await recordMeasurement({
      ...telemetry,
      authState: input.authState,
      baseUrl,
      cacheControl: getHeader(response, "cache-control"),
      cacheState: input.cacheState,
      cfCacheStatus: getHeader(response, "cf-cache-status"),
      device: testInfo.project.name,
      durationMs,
      environment,
      error: errorMessage,
      httpStatus: response?.status(),
      kind: input.kind,
      locale,
      name: input.name,
      productSlug,
      project: testInfo.project.name,
      repeatIndex: testInfo.repeatEachIndex,
      responseDurationMs: getResponseDurationMs(response),
      runIndex: testInfo.repeatEachIndex + 1,
      scenario: input.scenario,
      schemaVersion: 1,
      serverTraceName: input.serverTraceName,
      status,
      target: input.target,
      timestamp: new Date().toISOString(),
      url: response?.url(),
      xVercelCache: getHeader(response, "x-vercel-cache"),
    });
  }
}

async function waitForSurfaceReady(page: Page, surface: string) {
  const locator = page.locator(`[data-perf-surface="${surface}"]`).first();

  await expect(locator).toBeVisible();
  await expect(locator).toHaveAttribute("data-perf-ready", "true");
}

async function waitForSurfaceIdle(page: Page, surface: string) {
  const locator = page.locator(`[data-perf-surface="${surface}"]`).first();

  await waitForSurfaceReady(page, surface);
  await expect(locator).toHaveAttribute("data-perf-updating", "false");
}

async function gotoAndWait(page: Page, route: string, surface: string) {
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });

  await waitForSurfaceReady(page, surface);

  return response;
}

async function signInIfConfigured(page: Page, testInfo: TestInfo, callbackPath = `/${locale}`) {
  test.skip(
    !customerEmail || !customerPassword || !authBaseUrl,
    "Signed-in benchmarks need PERF_AUTH_BASE_URL, PERF_CUSTOMER_EMAIL, and PERF_CUSTOMER_PASSWORD.",
  );

  await measure(testInfo, {
    authState: "guest",
    kind: "action",
    name: "auth.sessionBootstrap",
    page,
    scenario: "auth.session-bootstrap",
    target: callbackPath,
  }, async () => {
    const callbackUrl = new URL(callbackPath, baseUrl);
    const authState = await createPerfAuthCookies({
      authBaseUrl,
      baseUrl,
      email: customerEmail,
    });

    await page.context().addCookies(authState.cookies);
    const response = await page.goto(callbackUrl.toString(), { waitUntil: "domcontentloaded" });

    await page.waitForURL(
      (url) => url.origin === callbackUrl.origin && url.pathname === callbackUrl.pathname,
      { timeout: 30_000 },
    );

    return response;
  });
}

function getCartDrawerBag(page: Page) {
  return page.locator('[data-perf-surface="cart-drawer-bag"]').first();
}

async function getFirstCartLineQuantity(page: Page) {
  const line = getCartDrawerBag(page).locator("[data-perf-cart-line]").first();
  const quantity = await line.getAttribute("data-perf-line-quantity");

  return Number(quantity ?? 0);
}

async function waitForFirstCartLineQuantity(page: Page, predicate: (quantity: number) => boolean) {
  await expect.poll(async () => predicate(await getFirstCartLineQuantity(page))).toBe(true);
}

async function waitForCartLineCount(page: Page, predicate: (count: number) => boolean) {
  await expect.poll(async () => predicate(await getCartDrawerBag(page).locator("[data-perf-cart-line]").count())).toBe(true);
}

async function ensureProductLikeState(page: Page, liked: boolean) {
  const detailLike = page.locator('[data-perf-surface="product-like"][data-perf-placement="detail"]').first();

  await expect(detailLike).toBeVisible();
  await expect(detailLike).toHaveAttribute("data-perf-updating", "false");

  const unlikeButton = page.getByRole("button", { name: /remove from saved|fjern fra gemte/i }).first();
  const isLiked = await unlikeButton.isVisible().catch(() => false);

  if (isLiked === liked) {
    return;
  }

  const toggle = isLiked
    ? unlikeButton
    : page.getByRole("button", { name: /save product|gem produkt/i }).first();

  await toggle.click();
  await expect(detailLike).toHaveAttribute("data-perf-updating", "false");
}

async function fillCheckoutForm(page: Page) {
  await page.locator('input[name="email"]').fill(customerEmail ?? "performance@example.com");
  await page.locator('input[name="firstName"]').fill("Performance");
  await page.locator('input[name="lastName"]').fill("Runner");
  await page.locator('input[name="line1"]').fill("Performancevej 1");
  await page.locator('input[name="postalCode"]').fill("2100");
  await page.locator('input[name="city"]').fill("Copenhagen");
  await page.locator('input[name="phone"]').fill("+4512345678");
}

test.describe("storefront public route loads", () => {
  for (const routeConfig of publicRoutes) {
    test(`${routeConfig.name}`, async ({ page }, testInfo) => {
      await measure(testInfo, {
        authState: "guest",
        cacheState: "cold",
        kind: "route",
        name: routeConfig.name,
        page,
        scenario: routeConfig.scenario,
        serverTraceName: routeConfig.serverTraceName,
        target: routeConfig.route,
      }, () => gotoAndWait(page, routeConfig.route, routeConfig.surface));

      await measure(testInfo, {
        authState: "guest",
        cacheState: "warm",
        kind: "route",
        name: `${routeConfig.name}.warm`,
        page,
        scenario: routeConfig.scenario,
        serverTraceName: routeConfig.serverTraceName,
        target: routeConfig.route,
      }, () => gotoAndWait(page, routeConfig.route, routeConfig.surface));
    });
  }

  test("route.public.accountSignedOutRedirect", async ({ page }, testInfo) => {
    await measure(testInfo, {
      authState: "guest",
      cacheState: "cold",
      kind: "route",
      name: "route.public.accountSignedOutRedirect",
      page,
      scenario: "public.account.signed-out-redirect",
      target: `/${locale}/account`,
    }, async () => {
      const response = await page.goto(`/${locale}/account`, { waitUntil: "domcontentloaded" });

      await page.waitForURL(/\/sign-in(\?|$)/, { timeout: 30_000 });

      return response;
    });
  });
});

test("anonymous cart mutation flow", async ({ page }, testInfo) => {
  await gotoAndWait(page, `/${locale}/products/${productSlug}`, "product-detail");

  await measure(testInfo, {
    authState: "guest",
    kind: "action",
    name: "cart.addItem",
    page,
    scenario: "cart.anonymous.add",
    serverTraceName: "storefront.cart.addItem",
    target: productSlug,
  }, async () => {
    await page.getByRole("button", { name: /add to bag|læg i kurv/i }).first().click();
    await waitForSurfaceIdle(page, "cart-drawer");
    await waitForCartLineCount(page, (count) => count > 0);
  });

  await measure(testInfo, {
    authState: "guest",
    kind: "action",
    name: "cart.incrementQuantity",
    page,
    scenario: "cart.anonymous.increment",
    serverTraceName: "storefront.cart.updateQuantity",
    target: productSlug,
  }, async () => {
    const previousQuantity = await getFirstCartLineQuantity(page);
    const cartDrawerBag = getCartDrawerBag(page);

    await cartDrawerBag.getByRole("button", { name: /increase quantity/i }).first().click();
    await waitForSurfaceIdle(page, "cart-drawer");
    await waitForFirstCartLineQuantity(page, (quantity) => quantity > previousQuantity);
  });

  await measure(testInfo, {
    authState: "guest",
    kind: "action",
    name: "cart.decrementQuantity",
    page,
    scenario: "cart.anonymous.decrement",
    serverTraceName: "storefront.cart.updateQuantity",
    target: productSlug,
  }, async () => {
    const previousQuantity = await getFirstCartLineQuantity(page);
    const cartDrawerBag = getCartDrawerBag(page);

    await cartDrawerBag.getByRole("button", { name: /decrease quantity/i }).first().click();
    await waitForSurfaceIdle(page, "cart-drawer");
    await waitForFirstCartLineQuantity(page, (quantity) => quantity < previousQuantity);
  });

  await measure(testInfo, {
    authState: "guest",
    kind: "action",
    name: "cart.removeItem",
    page,
    scenario: "cart.anonymous.remove",
    serverTraceName: "storefront.cart.removeItem",
    target: productSlug,
  }, async () => {
    await getCartDrawerBag(page).getByRole("button", { name: /decrease quantity/i }).first().click();
    await waitForSurfaceIdle(page, "cart-drawer");
    await waitForCartLineCount(page, (count) => count === 0);
  });
});

test("signed-in like, wishlist, and cart drawer likes flow", async ({ page }, testInfo) => {
  await signInIfConfigured(page, testInfo);
  await gotoAndWait(page, `/${locale}/products/${productSlug}`, "product-detail");
  await ensureProductLikeState(page, false);

  await measure(testInfo, {
    authState: "signed-in",
    kind: "action",
    name: "product.like",
    page,
    scenario: "product.signed-in.like",
    serverTraceName: "storefront.product.toggleLike",
    target: productSlug,
  }, async () => {
    const detailLike = page.locator('[data-perf-surface="product-like"][data-perf-placement="detail"]').first();

    await page.getByRole("button", { name: /save product|gem produkt/i }).first().click();
    await expect(detailLike).toHaveAttribute("data-perf-updating", "false");
    await expect(page.getByRole("button", { name: /remove from saved|fjern fra gemte/i }).first()).toBeVisible();
  });

  await measure(testInfo, {
    authState: "signed-in",
    cacheState: "cold",
    kind: "route",
    name: "route.signedIn.wishlist",
    page,
    scenario: "wishlist.signed-in.load",
    serverTraceName: "storefront.catalog.productCards.personalized",
    target: `/${locale}/wishlist`,
  }, () => gotoAndWait(page, `/${locale}/wishlist`, "wishlist"));

  await gotoAndWait(page, `/${locale}/products/${productSlug}`, "product-detail");
  await page.getByRole("button", { name: /add to bag|læg i kurv/i }).first().click();
  await waitForSurfaceIdle(page, "cart-drawer");

  await measure(testInfo, {
    authState: "signed-in",
    kind: "action",
    name: "cart.drawerLikes.load",
    page,
    scenario: "cart.signed-in.drawer-likes",
    serverTraceName: "storefront.cart.loadLikes",
    target: productSlug,
  }, async () => {
    await page.getByRole("tab", { name: /likes/i }).click();
    await waitForSurfaceIdle(page, "cart-drawer-likes");
  });

  await gotoAndWait(page, `/${locale}/products/${productSlug}`, "product-detail");
  await ensureProductLikeState(page, true);

  await measure(testInfo, {
    authState: "signed-in",
    kind: "action",
    name: "product.unlike",
    page,
    scenario: "product.signed-in.unlike",
    serverTraceName: "storefront.product.toggleLike",
    target: productSlug,
  }, async () => {
    const detailLike = page.locator('[data-perf-surface="product-like"][data-perf-placement="detail"]').first();

    await page.getByRole("button", { name: /remove from saved|fjern fra gemte/i }).first().click();
    await expect(detailLike).toHaveAttribute("data-perf-updating", "false");
    await expect(page.getByRole("button", { name: /save product|gem produkt/i }).first()).toBeVisible();
  });
});

test("signed-in account dashboard and sign-out flow", async ({ page }, testInfo) => {
  await signInIfConfigured(page, testInfo, `/${locale}/account`);

  await measure(testInfo, {
    authState: "signed-in",
    cacheState: "cold",
    kind: "route",
    name: "route.signedIn.account",
    page,
    scenario: "account.signed-in.dashboard",
    serverTraceName: "storefront.account.dashboard",
    target: `/${locale}/account`,
  }, () => gotoAndWait(page, `/${locale}/account`, "account"));

  await measure(testInfo, {
    authState: "signed-in",
    kind: "action",
    name: "account.quickLink.addresses",
    page,
    scenario: "account.quick-link.addresses",
    target: `/${locale}/account/addresses`,
  }, async () => {
    await page.locator('[data-account-link="addresses"]').click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/account/addresses`));
  });

  await page.goBack({ waitUntil: "domcontentloaded" });
  await waitForSurfaceReady(page, "account");

  await measure(testInfo, {
    authState: "signed-in",
    kind: "action",
    name: "account.quickLink.rewards",
    page,
    scenario: "account.quick-link.rewards",
    target: `/${locale}/account/rewards`,
  }, async () => {
    await page.locator('[data-account-link="rewards"]').click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/account/rewards`));
  });

  await page.goBack({ waitUntil: "domcontentloaded" });
  await waitForSurfaceReady(page, "account");

  await measure(testInfo, {
    authState: "signed-in",
    kind: "action",
    name: "account.signOut",
    page,
    scenario: "account.sign-out",
    target: `/${locale}`,
  }, async () => {
    const signOutResponse = page.waitForResponse((response) => (
      response.url() === `${baseUrl}/${locale}/account/sign-out` &&
      response.request().method() === "POST"
    ));

    await page.locator('[data-account-sign-out="true"]').click({ noWaitAfter: true });
    await page.waitForURL(new RegExp(`/${locale}/?$`), { timeout: 30_000 });

    return signOutResponse;
  });

  await measure(testInfo, {
    authState: "guest",
    kind: "route",
    name: "account.signedOutRedirect",
    page,
    scenario: "account.signed-out-redirect",
    target: `/${locale}/account`,
  }, async () => {
    const response = await page.goto(`/${locale}/account`, { waitUntil: "domcontentloaded" });

    await page.waitForURL(/\/sign-in(\?|$)/, { timeout: 30_000 });

    return response;
  });
});

test("signed-in cart and checkout entry flow", async ({ page }, testInfo) => {
  await signInIfConfigured(page, testInfo);
  await gotoAndWait(page, `/${locale}/products/${productSlug}`, "product-detail");

  await measure(testInfo, {
    authState: "signed-in",
    kind: "action",
    name: "cart.signedIn.addItem",
    page,
    scenario: "cart.signed-in.add",
    serverTraceName: "storefront.cart.addItem",
    target: productSlug,
  }, async () => {
    await page.getByRole("button", { name: /add to bag|læg i kurv/i }).first().click();
    await waitForSurfaceIdle(page, "cart-drawer");
    await waitForCartLineCount(page, (count) => count > 0);
  });

  await measure(testInfo, {
    authState: "signed-in",
    cacheState: "cold",
    kind: "route",
    name: "route.signedIn.cartWithItems",
    page,
    scenario: "cart.signed-in.load-with-items",
    serverTraceName: "storefront.cart.loadExisting",
    target: `/${locale}/cart`,
  }, () => gotoAndWait(page, `/${locale}/cart`, "cart-page"));

  await measure(testInfo, {
    authState: "signed-in",
    cacheState: "cold",
    kind: "route",
    name: "route.signedIn.checkoutEntry",
    page,
    scenario: "checkout.signed-in.entry",
    serverTraceName: "storefront.checkout.prefill",
    target: `/${locale}/checkout`,
  }, () => gotoAndWait(page, `/${locale}/checkout`, "checkout"));

  if (process.env.PERF_CHECKOUT_PAYMENT_PREP !== "1") {
    return;
  }

  assertStripeTestPaymentPrep();

  await measure(testInfo, {
    authState: "signed-in",
    kind: "action",
    name: "checkout.preparePayment",
    page,
    scenario: "checkout.signed-in.prepare-payment",
    serverTraceName: "storefront.checkout.preparePayment",
    target: `/${locale}/checkout`,
  }, async () => {
    await fillCheckoutForm(page);
    await page.getByRole("button", { name: /continue to payment|fortsæt til betaling/i }).click();
    await waitForSurfaceIdle(page, "checkout");
    await waitForSurfaceReady(page, "checkout-payment");
  });
});
