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

export async function transactionPostgres<T>(
  callback: (
    query: <R extends QueryResultRow>(
      query: string | QueryConfig,
      values?: unknown[],
    ) => Promise<{ rows: R[] }>,
  ) => Promise<T>,
) {
  const client = await getPostgresPool().connect();
  const query = <R extends QueryResultRow>(queryText: string | QueryConfig, values?: unknown[]) =>
    client.query<R>(queryText, values);

  try {
    await client.query("begin");
    const result = await callback(query);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
