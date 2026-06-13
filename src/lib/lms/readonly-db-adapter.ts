import "server-only";

import { Pool, type QueryResultRow } from "pg";

import type {
  LmsCompletionBucket,
  LmsContentCatalogRecord,
  LmsContentGroup,
  LmsContentType,
  LmsLearningRecord,
  LmsReadonlyViewAdapter,
} from "@/lib/lms/contracts";
import { getLmsReadonlyDbEnv } from "@/lib/lms/readonly-db-env";

type LmsContentCatalogRow = QueryResultRow & {
  lms_content_id: string;
  lms_course_round_id: string | null;
  content_group: string;
  content_type: string;
  content_title: string;
  course_round_title: string | null;
  provider_org: string | null;
  open_status_code: string | null;
  open_status_label: string | null;
  apply_starts_at: Date | string | null;
  apply_ends_at: Date | string | null;
  learning_starts_at: Date | string | null;
  learning_ends_at: Date | string | null;
  updated_at: Date | string | null;
};

type LmsLearningRecordRow = QueryResultRow & {
  lms_record_id: string;
  lms_user_id: string;
  keycloak_subject: string | null;
  user_name: string | null;
  user_email: string | null;
  user_phone_masked: string | null;
  lms_content_id: string;
  lms_course_round_id: string | null;
  content_group: string;
  content_type: string;
  content_title: string;
  course_round_title: string | null;
  participation_status_code: string | null;
  participation_status_label: string | null;
  completion_status_code: string | null;
  completion_status_label: string | null;
  completion_bucket: string | null;
  progress_rate: number | string | null;
  score: number | string | null;
  learning_time_minutes: number | string | null;
  started_at: Date | string | null;
  completed_at: Date | string | null;
  updated_at: Date | string | null;
};

const contentGroups: LmsContentGroup[] = ["regular", "subscription", "community"];
const contentTypes: LmsContentType[] = [
  "offline",
  "realtime",
  "hyflex",
  "online",
  "knowledge",
  "ebook",
  "learning_group",
  "seminar",
];
const completionBuckets: LmsCompletionBucket[] = ["completed", "not_completed"];

let lmsPool: Pool | undefined;

function getLmsPool() {
  if (!lmsPool) {
    const env = getLmsReadonlyDbEnv();
    lmsPool = new Pool({
      connectionString: env.databaseUrl,
      ssl: env.ssl ? { rejectUnauthorized: true } : undefined,
    });
  }

  return lmsPool;
}

function quoteIdentifierPath(name: string) {
  const parts = name.split(".");
  if (parts.length > 2) {
    throw new Error(`Invalid LMS readonly view name: ${name}`);
  }

  return parts
    .map((part) => {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(part)) {
        throw new Error(`Invalid LMS readonly view identifier: ${name}`);
      }
      return `"${part}"`;
    })
    .join(".");
}

function normalizeContentGroup(value: string): LmsContentGroup {
  if (contentGroups.includes(value as LmsContentGroup)) {
    return value as LmsContentGroup;
  }

  throw new Error(`Unsupported LMS content_group value: ${value}`);
}

function normalizeContentType(value: string): LmsContentType {
  if (contentTypes.includes(value as LmsContentType)) {
    return value as LmsContentType;
  }

  throw new Error(`Unsupported LMS content_type value: ${value}`);
}

function normalizeCompletionBucket(value: string | null): LmsCompletionBucket | undefined {
  if (!value) {
    return undefined;
  }
  if (completionBuckets.includes(value as LmsCompletionBucket)) {
    return value as LmsCompletionBucket;
  }

  throw new Error(`Unsupported LMS completion_bucket value: ${value}`);
}

function numberOrUndefined(value: number | string | null) {
  if (value === null || value === "") {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function textOrUndefined(value: string | null) {
  return value ?? undefined;
}

function dateOrTextOrUndefined(value: Date | string | null) {
  if (!value) {
    return undefined;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function mapCatalogRow(row: LmsContentCatalogRow): LmsContentCatalogRecord {
  return {
    lmsContentId: row.lms_content_id,
    lmsCourseRoundId: textOrUndefined(row.lms_course_round_id),
    contentGroup: normalizeContentGroup(row.content_group),
    contentType: normalizeContentType(row.content_type),
    contentTitle: row.content_title,
    courseRoundTitle: textOrUndefined(row.course_round_title),
    providerOrg: textOrUndefined(row.provider_org),
    openStatusCode: textOrUndefined(row.open_status_code),
    openStatusLabel: textOrUndefined(row.open_status_label),
    applyStartsAt: dateOrTextOrUndefined(row.apply_starts_at),
    applyEndsAt: dateOrTextOrUndefined(row.apply_ends_at),
    learningStartsAt: dateOrTextOrUndefined(row.learning_starts_at),
    learningEndsAt: dateOrTextOrUndefined(row.learning_ends_at),
    updatedAt: dateOrTextOrUndefined(row.updated_at),
  };
}

function mapLearningRecordRow(row: LmsLearningRecordRow): LmsLearningRecord {
  return {
    lmsRecordId: row.lms_record_id,
    lmsUserId: row.lms_user_id,
    keycloakSubject: textOrUndefined(row.keycloak_subject),
    userName: textOrUndefined(row.user_name),
    userEmail: textOrUndefined(row.user_email),
    userPhoneMasked: textOrUndefined(row.user_phone_masked),
    lmsContentId: row.lms_content_id,
    lmsCourseRoundId: textOrUndefined(row.lms_course_round_id),
    contentGroup: normalizeContentGroup(row.content_group),
    contentType: normalizeContentType(row.content_type),
    contentTitle: row.content_title,
    courseRoundTitle: textOrUndefined(row.course_round_title),
    participationStatusCode: textOrUndefined(row.participation_status_code),
    participationStatusLabel: textOrUndefined(row.participation_status_label),
    completionStatusCode: textOrUndefined(row.completion_status_code),
    completionStatusLabel: textOrUndefined(row.completion_status_label),
    completionBucket: normalizeCompletionBucket(row.completion_bucket),
    progressRate: numberOrUndefined(row.progress_rate),
    score: numberOrUndefined(row.score),
    learningTimeMinutes: numberOrUndefined(row.learning_time_minutes),
    startedAt: dateOrTextOrUndefined(row.started_at),
    completedAt: dateOrTextOrUndefined(row.completed_at),
    updatedAt: dateOrTextOrUndefined(row.updated_at),
  };
}

export const readonlyDbLmsReadonlyViewAdapter: LmsReadonlyViewAdapter = {
  async listContentCatalog() {
    const env = getLmsReadonlyDbEnv();
    const viewName = quoteIdentifierPath(env.contentCatalogView);
    const result = await getLmsPool().query<LmsContentCatalogRow>(
      `
        select
          lms_content_id,
          lms_course_round_id,
          content_group,
          content_type,
          content_title,
          course_round_title,
          provider_org,
          open_status_code,
          open_status_label,
          apply_starts_at,
          apply_ends_at,
          learning_starts_at,
          learning_ends_at,
          updated_at
        from ${viewName}
        order by updated_at desc nulls last, content_title asc
        limit $1
      `,
      [env.queryLimit],
    );

    return result.rows.map(mapCatalogRow);
  },

  async listLearningRecordsByUser(input) {
    if (!input.lmsUserId && !input.keycloakSubject) {
      return [];
    }

    const env = getLmsReadonlyDbEnv();
    const viewName = quoteIdentifierPath(env.learningRecordView);
    const values: unknown[] = [];
    const filters: string[] = [];

    if (input.lmsUserId) {
      values.push(input.lmsUserId);
      filters.push(`lms_user_id = $${values.length}`);
    }
    if (input.keycloakSubject) {
      values.push(input.keycloakSubject);
      filters.push(`keycloak_subject = $${values.length}`);
    }

    values.push(env.queryLimit);

    const result = await getLmsPool().query<LmsLearningRecordRow>(
      `
        select
          lms_record_id,
          lms_user_id,
          keycloak_subject,
          user_name,
          user_email,
          user_phone_masked,
          lms_content_id,
          lms_course_round_id,
          content_group,
          content_type,
          content_title,
          course_round_title,
          participation_status_code,
          participation_status_label,
          completion_status_code,
          completion_status_label,
          completion_bucket,
          progress_rate,
          score,
          learning_time_minutes,
          started_at,
          completed_at,
          updated_at
        from ${viewName}
        where ${filters.join(" or ")}
        order by updated_at desc nulls last, completed_at desc nulls last
        limit $${values.length}
      `,
      values,
    );

    return result.rows.map(mapLearningRecordRow);
  },
};
