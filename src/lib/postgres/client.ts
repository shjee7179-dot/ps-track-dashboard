import "server-only";

import { Pool, type QueryConfig, type QueryResultRow } from "pg";

import { getPostgresEnv } from "@/lib/postgres/env";

let pool: Pool | undefined;

export function getPostgresPool() {
  if (!pool) {
    const env = getPostgresEnv();
    pool = new Pool({
      connectionString: env.databaseUrl,
      ssl: env.ssl ? { rejectUnauthorized: true } : undefined,
    });
  }

  return pool;
}

export async function queryPostgres<T extends QueryResultRow>(
  query: string | QueryConfig,
  values?: unknown[],
) {
  return getPostgresPool().query<T>(query, values);
}
