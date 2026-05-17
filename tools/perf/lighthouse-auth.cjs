const emailSelector = 'input[type="email"], input[name="email"], input[autocomplete="email"]';
const passwordSelector = 'input[type="password"], input[name="password"], input[autocomplete="current-password"]';

module.exports = async function lighthouseAuth(browser) {
  const baseUrl = (process.env.PERF_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
  const authBaseUrl = process.env.PERF_AUTH_BASE_URL?.replace(/\/$/, "");
  const locale = process.env.PERF_LOCALE || "da";
  const customerEmail = process.env.PERF_CUSTOMER_EMAIL;
  const customerPassword = process.env.PERF_CUSTOMER_PASSWORD;
  const vercelBypassToken =
    process.env.PERF_VERCEL_BYPASS_TOKEN || process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

  if (!authBaseUrl || !customerEmail || !customerPassword) {
    throw new Error(
      "Account Lighthouse needs PERF_AUTH_BASE_URL, PERF_CUSTOMER_EMAIL, and PERF_CUSTOMER_PASSWORD.",
    );
  }

  const page = await browser.newPage();

  if (vercelBypassToken) {
    await page.setExtraHTTPHeaders({
      "x-vercel-protection-bypass": vercelBypassToken,
      "x-vercel-set-bypass-cookie": "true",
    });
  }

  const callbackUrl = `${baseUrl}/${locale}/account`;
  const signInUrl = new URL(`/${locale}/sign-in`, authBaseUrl);

  signInUrl.searchParams.set("callbackURL", callbackUrl);

  await page.goto(signInUrl.toString(), { waitUntil: "domcontentloaded" });

  const emailInput = await page.waitForSelector(emailSelector, { timeout: 15_000 }).catch(() => null);

  if (!emailInput) {
    await page.waitForSelector('[data-account-ready="true"]', { timeout: 30_000 });
    await page.close();
    return;
  }

  await emailInput.click({ clickCount: 3 });
  await emailInput.type(customerEmail);
  const passwordInput = await page.waitForSelector(passwordSelector, { timeout: 15_000 });

  await passwordInput.click({ clickCount: 3 });
  await passwordInput.type(customerPassword);
  await Promise.all([
    page.waitForNavigation({ timeout: 30_000, waitUntil: "domcontentloaded" }).catch(() => null),
    page.click('button[type="submit"], input[type="submit"]'),
  ]);
  await page.waitForSelector('[data-account-ready="true"]', { timeout: 30_000 });
  await page.close();
};
