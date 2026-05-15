import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getDatabaseUrl } from "@snn/config";

import * as schema from "./schema/index";

let database: ReturnType<typeof createDatabase> | undefined;
let pool: Pool | undefined;

function createDatabase() {
  pool = new Pool({
    connectionString: getDatabaseUrl(),
  });

  return drizzle(pool, { schema });
}

export function getDb() {
  if (!database) {
    database = createDatabase();
  }

  return database;
}

export async function closeDb() {
  await pool?.end();
  pool = undefined;
  database = undefined;
}
