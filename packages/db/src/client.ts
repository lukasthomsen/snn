import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { getDatabaseUrl } from "@veloro/config";

import * as schema from "./schema/index";

let database: ReturnType<typeof createDatabase> | undefined;

function createDatabase() {
  const sql = neon(getDatabaseUrl());

  return drizzle(sql, { schema });
}

export function getDb() {
  if (!database) {
    database = createDatabase();
  }

  return database;
}

