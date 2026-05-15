import { promises as fs } from "node:fs";
import * as path from "node:path";

import { expect, test, type Page, type TestInfo } from "@playwright/test";

type Measurement = {
  durationMs: number;
  name: string;
  project: string;
  timestamp: string;
};

const locale = process.env.PERF_LOCALE ?? "da";
const baseUrl = process.env.PERF_BASE_URL ?? "http://localhost:3000";
const productSlug = process.env.PERF_PRODUCT_SLUG ?? "essential-creatine-monohydrate";
const customerEmail = process.env.PERF_CUSTOMER_EMAIL;
const customerPassword = process.env.PERF_CUSTOMER_PASSWORD;
const authBaseUrl = process.env.PERF_AUTH_BASE_URL?.replace(/\/$/, "");
const measurementFile = path.join("perf-reports", "playwright", "measurements.ndjson");

async function recordMeasurement(testInfo: TestInfo, measurement: Omit<Measurement, "project" | "timestamp">) {
  await fs.mkdir(path.dirname(measurementFile), { recursive: true });
  await fs.appendFile(measurementFile, `${JSON.stringify({
    ...measurement,
    project: testInfo.project.name,
    timestamp: new Date().toISOString(),
  })}\n`);
}

async function measure<T>(
  testInfo: TestInfo,
  name: string,
  operation: () => Promise<T>,
) {
  const startedAt = performance.now();
  const result = await operation();
  const durationMs = Math.round((performance.now() - startedAt) * 10) / 10;

  await recordMeasurement(testInfo, {
    durationMs,
    name,
  });

  return result;
}

async function waitForSettledPage(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
}

async function signInIfConfigured(page: Page, testInfo: TestInfo) {
  test.skip(!customerEmail || !customerPassword || !authBaseUrl, "Signed-in benchmarks need PERF_AUTH_BASE_URL, PERF_CUSTOMER_EMAIL, and PERF_CUSTOMER_PASSWORD.");

  await measure(testInfo, "auth.signIn", async () => {
    const callbackUrl = new URL(`/${locale}`, baseUrl);
    const signInUrl = new URL(`/${locale}/sign-in`, authBaseUrl);

    signInUrl.searchParams.set("callbackURL", callbackUrl.toString());
    await page.goto(signInUrl.toString());
    await page.getByLabel(/email/i).fill(customerEmail ?? "");
    await page.getByLabel(/password|adgangskode/i).fill(customerPassword ?? "");
    await page.getByRole("button", { name: /sign in|log ind/i }).click();
    await page.waitForURL(new RegExp(`/${locale}`), { timeout: 30_000 });
  });
}

test.describe("storefront page loads", () => {
  for (const route of [
    `/${locale}`,
    `/${locale}/products`,
    `/${locale}/products?sort=newest`,
    `/${locale}/products/${productSlug}`,
    `/${locale}/cart`,
    `/${locale}/checkout`,
    `/${locale}/wishlist`,
  ]) {
    test(`loads ${route}`, async ({ page }, testInfo) => {
      await measure(testInfo, `route.load:${route}`, async () => {
        await page.goto(route);
        await waitForSettledPage(page);
      });

      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test("anonymous cart flow", async ({ page }, testInfo) => {
  await page.goto(`/${locale}/products/${productSlug}`);
  await waitForSettledPage(page);

  await measure(testInfo, "cart.addItem", async () => {
    await page.getByRole("button", { name: /add to bag|læg i kurv/i }).first().click();
    await expect(page.getByText(/your bag|kurv|bag/i).first()).toBeVisible();
  });

  await measure(testInfo, "cart.incrementQuantity", async () => {
    await page.getByRole("button", { name: /increase quantity/i }).first().click();
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  });

  await measure(testInfo, "cart.decrementQuantity", async () => {
    await page.getByRole("button", { name: /decrease quantity/i }).first().click();
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  });

  await measure(testInfo, "cart.removeItem", async () => {
    await page.getByRole("button", { name: /decrease quantity/i }).first().click();
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  });
});

test("signed-in like and wishlist flow", async ({ page }, testInfo) => {
  await signInIfConfigured(page, testInfo);
  await page.goto(`/${locale}/products/${productSlug}`);
  await waitForSettledPage(page);

  await measure(testInfo, "product.like", async () => {
    await page.getByRole("button", { name: /save product|gem produkt/i }).first().click();
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  });

  await measure(testInfo, "product.unlike", async () => {
    await page.getByRole("button", { name: /remove from saved|fjern fra gemte/i }).first().click();
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  });

  await measure(testInfo, "wishlist.load", async () => {
    await page.goto(`/${locale}/wishlist`);
    await waitForSettledPage(page);
  });
});
