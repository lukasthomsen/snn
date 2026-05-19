const { createPerfAuthCookies } = require("./auth-state.cjs");

function toPuppeteerCookie(baseUrl, cookie) {
  const { domain: _domain, ...rest } = cookie;

  return {
    ...rest,
    url: baseUrl,
  };
}

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
  const { cookies } = await createPerfAuthCookies({
    authBaseUrl,
    baseUrl,
    email: customerEmail,
  });

  await page.setCookie(...cookies.map((cookie) => toPuppeteerCookie(baseUrl, cookie)));

  if (vercelBypassToken) {
    await page.setExtraHTTPHeaders({
      "x-vercel-protection-bypass": vercelBypassToken,
      "x-vercel-set-bypass-cookie": "true",
    });
  }

  await page.goto(`${baseUrl}/${locale}/account`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-account-ready="true"]', { timeout: 30_000 });
  await page.close();
};
