import "server-only";

export type LmsReadonlyDbEnv = {
  databaseUrl: string;
  ssl: boolean;
  contentCatalogView: string;
  learningRecordView: string;
  queryLimit: number;
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

function readPositiveIntegerEnv(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`Invalid positive integer environment value: ${value}`);
  }

  return parsed;
}

export function getLmsReadonlyDbEnv(): LmsReadonlyDbEnv {
  return {
    databaseUrl: requireEnv("LMS_DATABASE_URL", process.env.LMS_DATABASE_URL),
    ssl: readBooleanEnv(process.env.LMS_POSTGRES_SSL),
    contentCatalogView: process.env.LMS_CONTENT_CATALOG_VIEW ?? "lms_content_catalog_view",
    learningRecordView: process.env.LMS_LEARNING_RECORD_VIEW ?? "lms_learning_record_view",
    queryLimit: readPositiveIntegerEnv(process.env.LMS_READONLY_QUERY_LIMIT, 500),
  };
}
