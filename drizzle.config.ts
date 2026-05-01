import { existsSync } from "node:fs";

import { neonConfig } from "@neondatabase/serverless";
import { defineConfig } from "drizzle-kit";
import ws from "ws";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

neonConfig.webSocketConstructor = ws;

export default defineConfig({
  out: "./drizzle",
  schema: "./packages/db/src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL_UNPOOLED ??
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/snn",
  },
  strict: true,
  verbose: true,
});
