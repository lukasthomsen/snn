import { existsSync } from "node:fs";

import { getCatalogHealthReport, getCommerceAdminOverview } from "@snn/commerce";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

async function main() {
  const [overview, report] = await Promise.all([
    getCommerceAdminOverview(),
    getCatalogHealthReport({
      countryCode: "DK",
      locale: "da",
    }),
  ]);
  const blockingIssues = report.issues.filter((issue) => issue.severity === "danger");

  console.log("Commerce health check");
  console.log(`Generated: ${report.generatedAt.toISOString()}`);
  console.log(`Market: ${report.market.name} (${report.market.code}/${report.market.currencyCode})`);
  console.log(
    `Counts: ${overview.counts.products} products, ${overview.counts.variants} variants, ${overview.counts.prices} prices, ${overview.counts.inventoryItems} inventory items`,
  );

  if (report.issues.length === 0) {
    console.log("No catalog health issues found.");
    return;
  }

  for (const issue of report.issues) {
    console.log("");
    console.log(`[${issue.severity.toUpperCase()}] ${issue.title}`);
    console.log(issue.description);

    if (issue.sampledIds.length > 0) {
      console.log(`Samples: ${issue.sampledIds.join(", ")}`);
    }
  }

  if (blockingIssues.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Commerce health check failed.");
  console.error(error);
  process.exitCode = 1;
});
