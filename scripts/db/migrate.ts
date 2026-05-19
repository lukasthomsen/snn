import { existsSync } from "node:fs";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL must be set.");
}

const pool = new Pool({
  connectionString: normalizeDatabaseSslMode(connectionString),
  max: 1,
});

const db = drizzle({ client: pool });

async function main() {
  try {
    await migrate(db, {
      migrationsFolder: "drizzle",
      migrationsSchema: "public",
    });

    console.log("Migrations applied successfully.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Migration failed.");
  console.error(error);
  process.exitCode = 1;
});

function normalizeDatabaseSslMode(value: string) {
  try {
    const url = new URL(value);
    const sslMode = url.searchParams.get("sslmode");

    if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }
  } catch {
    return value;
  }

  return value;
}
