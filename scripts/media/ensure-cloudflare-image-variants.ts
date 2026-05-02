import { existsSync } from "node:fs";

import { ensureDefaultImageVariants } from "@snn/media";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

async function main() {
  const result = await ensureDefaultImageVariants();

  console.log(
    `Cloudflare Images variants ready. Existing: ${result.existing.length}. Created: ${result.created.length}.`,
  );

  if (result.created.length > 0) {
    console.log(`Created variants: ${result.created.join(", ")}`);
  }
}

main().catch((error) => {
  console.error("Unable to ensure Cloudflare Images variants.");
  console.error(error);
  process.exitCode = 1;
});
