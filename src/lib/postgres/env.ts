export type PostgresEnv = {
  databaseUrl: string;
  ssl: boolean;
};

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readBooleanEnv(value: string | undefined, fallback = false) {
  if (!value) {
    return fallback;
  }
  return value === "1" || value.toLowerCase() === "true";
}

export function getPostgresEnv(): PostgresEnv {
  return {
    databaseUrl: requireEnv("DATABASE_URL", process.env.DATABASE_URL),
    ssl: readBooleanEnv(process.env.POSTGRES_SSL),
  };
}
