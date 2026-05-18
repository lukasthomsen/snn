import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getDatabasePoolConfig, getDatabaseUrl } from "@snn/config";

import * as schema from "./schema/index";
import { instrumentPoolForPerformance } from "./performance";

let database: ReturnType<typeof createDatabase> | undefined;
let pool: Pool | undefined;

function createDatabase() {
  const poolConfig = getDatabasePoolConfig();

  pool = new Pool({
    connectionString: getDatabaseUrl(),
    ...(poolConfig.connectionTimeoutMillis
      ? { connectionTimeoutMillis: poolConfig.connectionTimeoutMillis }
      : {}),
    ...(poolConfig.idleTimeoutMillis
      ? { idleTimeoutMillis: poolConfig.idleTimeoutMillis }
      : {}),
    ...(poolConfig.max ? { max: poolConfig.max } : {}),
    ...(poolConfig.maxUses ? { maxUses: poolConfig.maxUses } : {}),
  });
  instrumentPoolForPerformance(pool);

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
