import "server-only";

import { getLmsProviderName } from "@/lib/lms/readonly-adapter";
import { getLmsReadonlyDbEnv } from "@/lib/lms/readonly-db-env";
import { getRepositoryProviderName } from "@/lib/repositories";
import { queryPostgres } from "@/lib/postgres/client";
import { getLmsReadonlyViewAdapter } from "@/lib/lms/readonly-adapter";

type ReadinessStatus = "ok" | "degraded" | "fail" | "skipped";

type ReadinessCheck = {
  key: string;
  label: string;
  status: ReadinessStatus;
  detail: string;
  latencyMs?: number;
};

export type ReadinessReport = {
  ok: boolean;
  service: "ps-track-dashboard";
  checkedAt: string;
  providers: {
    auth: string;
    repository: string;
    lms: string;
  };
  checks: ReadinessCheck[];
};

function nowMs() {
  return Date.now();
}

function errorDetail(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

async function runCheck(
  key: string,
  label: string,
  callback: () => Promise<Omit<ReadinessCheck, "key" | "label" | "latencyMs">>,
): Promise<ReadinessCheck> {
  const startedAt = nowMs();
  try {
    const result = await callback();
    return {
      key,
      label,
      ...result,
      latencyMs: nowMs() - startedAt,
    };
  } catch (error) {
    return {
      key,
      label,
      status: "fail",
      detail: errorDetail(error),
      latencyMs: nowMs() - startedAt,
    };
  }
}

async function checkRepository(): Promise<ReadinessCheck> {
  const provider = getRepositoryProviderName();
  return runCheck("repository", "Repository provider", async () => {
    if (provider !== "postgres") {
      return {
        status: "skipped",
        detail: `${provider} provider does not require a database readiness check`,
      };
    }

    await queryPostgres("select 1 as ok");
    return {
      status: "ok",
      detail: "PostgreSQL connection responded",
    };
  });
}

async function checkLms(): Promise<ReadinessCheck> {
  const provider = getLmsProviderName();
  return runCheck("lms", "LMS provider", async () => {
    if (provider === "none") {
      return {
        status: "skipped",
        detail: "LMS integration disabled",
      };
    }
    if (provider === "mock-view") {
      const catalog = await getLmsReadonlyViewAdapter().listContentCatalog();
      return {
        status: catalog.length > 0 ? "ok" : "degraded",
        detail: `mock-view catalog records: ${catalog.length}`,
      };
    }

    const env = getLmsReadonlyDbEnv();
    const catalog = await getLmsReadonlyViewAdapter().listContentCatalog();
    return {
      status: catalog.length > 0 ? "ok" : "degraded",
      detail: `readonly-db catalog records: ${catalog.length}; views: ${env.contentCatalogView}, ${env.learningRecordView}`,
    };
  });
}

function checkAuth(): ReadinessCheck {
  const provider = process.env.AUTH_PROVIDER ?? "mock";
  if (provider === "mock") {
    return {
      key: "auth",
      label: "Auth provider",
      status: "skipped",
      detail: "mock auth provider",
    };
  }
  if (provider === "keycloak") {
    return {
      key: "auth",
      label: "Auth provider",
      status: "ok",
      detail: "keycloak provider selected; trusted gateway header validation is request-scoped",
    };
  }

  return {
    key: "auth",
    label: "Auth provider",
    status: "fail",
    detail: `Unsupported AUTH_PROVIDER value: ${provider}`,
  };
}

export async function getReadinessReport(): Promise<ReadinessReport> {
  const checks = [checkAuth(), await checkRepository(), await checkLms()];
  const failed = checks.some((check) => check.status === "fail");
  const degraded = checks.some((check) => check.status === "degraded");

  return {
    ok: !failed && !degraded,
    service: "ps-track-dashboard",
    checkedAt: new Date().toISOString(),
    providers: {
      auth: process.env.AUTH_PROVIDER ?? "mock",
      repository: getRepositoryProviderName(),
      lms: getLmsProviderName(),
    },
    checks,
  };
}
