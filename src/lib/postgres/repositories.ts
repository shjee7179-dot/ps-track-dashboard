import "server-only";

import { mockRepositories } from "@/lib/mock-repositories";
import { queryPostgres } from "@/lib/postgres/client";
import type { CohortRepository, UserRepository } from "@/lib/repository-contracts";
import type {
  LmsContentGroup,
  LmsContentMapping,
  LmsContentMappingActivationRule,
  LmsContentMappingRepository,
  LmsContentMappingStatus,
  LmsContentType,
} from "@/lib/lms/contracts";
import type { Cohort, Role, RoleAssignment, ScopeType, User } from "@/lib/types";

type UserRow = {
  id: string;
  external_subject: string | null;
  email: string;
  name: string;
  affiliation: string;
  default_role: string;
  status: string;
};

type RoleAssignmentRow = {
  id: string;
  user_id: string;
  role: string;
  scope_type: string;
  scope_id: string;
  status: string;
};

type CohortRow = {
  id: string;
  name: string;
  agreement_date: Date | string | null;
  starts_at: Date | string;
  ends_at: Date | string;
  status: string;
};

type LmsContentMappingRow = {
  id: string;
  cohort_id: string;
  module_id: string;
  content_id: string;
  learning_piece_id: string;
  lms_content_id: string;
  lms_course_round_id: string | null;
  content_group: string;
  content_type: string;
  required: boolean;
  activation_rule: string;
  status: string;
  created_by: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

const roles: Role[] = ["student", "operator", "mentor", "pi", "admin"];
const scopeTypes: ScopeType[] = ["system", "program", "cohort", "track", "team", "student"];
const lmsContentGroups: LmsContentGroup[] = ["regular", "subscription", "community"];
const lmsContentTypes: LmsContentType[] = [
  "offline",
  "realtime",
  "hyflex",
  "online",
  "knowledge",
  "ebook",
  "learning_group",
  "seminar",
];
const lmsActivationRules: LmsContentMappingActivationRule[] = [
  "record_exists",
  "participation_active",
  "completion_completed",
];
const lmsMappingStatuses: LmsContentMappingStatus[] = ["draft", "active", "inactive"];

function isPostgresRole(value: string | null | undefined): value is Role {
  return roles.includes(value as Role);
}

function isPostgresScopeType(value: string): value is ScopeType {
  return scopeTypes.includes(value as ScopeType);
}

function isLmsContentGroup(value: string): value is LmsContentGroup {
  return lmsContentGroups.includes(value as LmsContentGroup);
}

function isLmsContentType(value: string): value is LmsContentType {
  return lmsContentTypes.includes(value as LmsContentType);
}

function isLmsActivationRule(value: string): value is LmsContentMappingActivationRule {
  return lmsActivationRules.includes(value as LmsContentMappingActivationRule);
}

function isLmsMappingStatus(value: string): value is LmsContentMappingStatus {
  return lmsMappingStatuses.includes(value as LmsContentMappingStatus);
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function toDateString(value: Date | string | null) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
}

function isUuid(value: string | undefined): value is string {
  return Boolean(
    value?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i),
  );
}

export function mapPostgresUser(row: UserRow): User | null {
  if (!isPostgresRole(row.default_role)) {
    return null;
  }
  if (row.status !== "active" && row.status !== "inactive") {
    return null;
  }

  return {
    id: row.id,
    externalSubject: row.external_subject ?? undefined,
    name: row.name,
    email: row.email,
    affiliation: row.affiliation,
    defaultRole: row.default_role,
    status: row.status,
  };
}

export function mapPostgresRoleAssignment(row: RoleAssignmentRow): RoleAssignment | null {
  if (!isPostgresRole(row.role) || !isPostgresScopeType(row.scope_type)) {
    return null;
  }
  if (row.status !== "active" && row.status !== "inactive") {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    role: row.role,
    scopeType: row.scope_type,
    scopeId: row.scope_id,
    status: row.status,
  };
}

export function mapPostgresCohort(row: CohortRow): Cohort | null {
  if (row.status !== "draft" && row.status !== "active" && row.status !== "closed") {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    agreementDate: toDateString(row.agreement_date),
    startsAt: toDateString(row.starts_at),
    endsAt: toDateString(row.ends_at),
    status: row.status,
  };
}

export function mapPostgresLmsContentMapping(row: LmsContentMappingRow): LmsContentMapping | null {
  if (
    !isLmsContentGroup(row.content_group) ||
    !isLmsContentType(row.content_type) ||
    !isLmsActivationRule(row.activation_rule) ||
    !isLmsMappingStatus(row.status)
  ) {
    return null;
  }

  return {
    id: row.id,
    cohortId: row.cohort_id,
    moduleId: row.module_id,
    contentId: row.content_id,
    learningPieceId: row.learning_piece_id,
    lmsContentId: row.lms_content_id,
    lmsCourseRoundId: row.lms_course_round_id ?? undefined,
    contentGroup: row.content_group,
    contentType: row.content_type,
    required: row.required,
    activationRule: row.activation_rule,
    status: row.status,
    createdBy: row.created_by ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

const userSelect = `
  select id, external_subject, email, name, affiliation, default_role, status
  from public.users
`;

const lmsContentMappingSelect = `
  select
    id,
    cohort_id,
    module_id,
    content_id,
    learning_piece_id,
    lms_content_id,
    lms_course_round_id,
    content_group,
    content_type,
    required,
    activation_rule,
    status,
    created_by,
    created_at,
    updated_at
  from public.lms_content_mappings
`;

const cohortSelect = `
  select id, name, agreement_date, starts_at, ends_at, status
  from public.cohorts
`;

export const postgresUserRepository: UserRepository = {
  async listUsers(query) {
    const limit = query?.limit ?? 100;
    const result = await queryPostgres<UserRow>(
      `${userSelect} order by name asc limit $1`,
      [limit],
    );

    return result.rows
      .map((row) => mapPostgresUser(row))
      .filter((user): user is User => Boolean(user));
  },
  async getUserById(userId) {
    const result = await queryPostgres<UserRow>(
      `${userSelect} where id = $1 limit 1`,
      [userId],
    );

    return result.rows[0] ? mapPostgresUser(result.rows[0]) ?? undefined : undefined;
  },
  async getUserByExternalSubject(externalSubject) {
    const result = await queryPostgres<UserRow>(
      `${userSelect} where external_subject = $1 limit 1`,
      [externalSubject],
    );

    return result.rows[0] ? mapPostgresUser(result.rows[0]) ?? undefined : undefined;
  },
  async listRoleAssignments(userId) {
    const baseQuery = `
      select id, user_id, role, scope_type, scope_id, status
      from public.role_assignments
    `;
    const result = userId
      ? await queryPostgres<RoleAssignmentRow>(
          `${baseQuery} where user_id = $1 order by created_at asc`,
          [userId],
        )
      : await queryPostgres<RoleAssignmentRow>(`${baseQuery} order by created_at asc`);

    return result.rows
      .map((row) => mapPostgresRoleAssignment(row))
      .filter((assignment): assignment is RoleAssignment => Boolean(assignment));
  },
};

export const postgresCohortRepository: CohortRepository = {
  async getActiveCohort() {
    const result = await queryPostgres<CohortRow>(
      `${cohortSelect}
       where status in ('active', 'draft')
       order by year desc, starts_at desc
       limit 1`,
    );

    return result.rows[0] ? mapPostgresCohort(result.rows[0]) ?? undefined : undefined;
  },
  listTeams: mockRepositories.cohorts.listTeams,
  getTeamById: mockRepositories.cohorts.getTeamById,
};

export const postgresLmsContentMappingRepository: LmsContentMappingRepository = {
  async listMappings(query) {
    const values: unknown[] = [];
    const filters: string[] = [];

    if (query?.cohortId) {
      values.push(query.cohortId);
      filters.push(`cohort_id = $${values.length}`);
    }
    if (query?.learningPieceId) {
      values.push(query.learningPieceId);
      filters.push(`learning_piece_id = $${values.length}`);
    }
    if (query?.lmsContentId) {
      values.push(query.lmsContentId);
      filters.push(`lms_content_id = $${values.length}`);
    }
    if (query?.status) {
      values.push(query.status);
      filters.push(`status = $${values.length}`);
    }

    values.push(query?.limit ?? 100);
    const whereClause = filters.length ? ` where ${filters.join(" and ")}` : "";
    const result = await queryPostgres<LmsContentMappingRow>(
      `${lmsContentMappingSelect}${whereClause} order by created_at desc limit $${values.length}`,
      values,
    );

    return result.rows
      .map((row) => mapPostgresLmsContentMapping(row))
      .filter((mapping): mapping is LmsContentMapping => Boolean(mapping));
  },
  async getMappingById(mappingId) {
    const result = await queryPostgres<LmsContentMappingRow>(
      `${lmsContentMappingSelect} where id = $1 limit 1`,
      [mappingId],
    );

    return result.rows[0] ? mapPostgresLmsContentMapping(result.rows[0]) ?? undefined : undefined;
  },
  async getMappingByLearningPiece(input) {
    const result = await queryPostgres<LmsContentMappingRow>(
      `${lmsContentMappingSelect}
       where cohort_id = $1 and learning_piece_id = $2
       limit 1`,
      [input.cohortId, input.learningPieceId],
    );

    return result.rows[0] ? mapPostgresLmsContentMapping(result.rows[0]) ?? undefined : undefined;
  },
  async createMapping(input) {
    const result = await queryPostgres<LmsContentMappingRow>(
      `
        insert into public.lms_content_mappings (
          cohort_id,
          module_id,
          content_id,
          learning_piece_id,
          lms_content_id,
          lms_course_round_id,
          content_group,
          content_type,
          required,
          activation_rule,
          status,
          created_by
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        returning
          id,
          cohort_id,
          module_id,
          content_id,
          learning_piece_id,
          lms_content_id,
          lms_course_round_id,
          content_group,
          content_type,
          required,
          activation_rule,
          status,
          created_by,
          created_at,
          updated_at
      `,
      [
        input.cohortId,
        input.moduleId,
        input.contentId,
        input.learningPieceId,
        input.lmsContentId,
        input.lmsCourseRoundId ?? null,
        input.contentGroup,
        input.contentType,
        input.required,
        input.activationRule,
        input.status,
        isUuid(input.createdBy) ? input.createdBy : null,
      ],
    );
    const mapping = result.rows[0] ? mapPostgresLmsContentMapping(result.rows[0]) : null;
    if (!mapping) {
      throw new Error("Failed to create LMS content mapping");
    }

    return mapping;
  },
  async updateMappingStatus(input) {
    const result = await queryPostgres<LmsContentMappingRow>(
      `
        update public.lms_content_mappings
        set status = $2
        where id = $1
        returning
          id,
          cohort_id,
          module_id,
          content_id,
          learning_piece_id,
          lms_content_id,
          lms_course_round_id,
          content_group,
          content_type,
          required,
          activation_rule,
          status,
          created_by,
          created_at,
          updated_at
      `,
      [input.mappingId, input.status],
    );

    return result.rows[0] ? mapPostgresLmsContentMapping(result.rows[0]) ?? undefined : undefined;
  },
};

export const postgresRepositories = {
  ...mockRepositories,
  users: postgresUserRepository,
  cohorts: postgresCohortRepository,
  lms: {
    ...mockRepositories.lms,
    contentMappings: postgresLmsContentMappingRepository,
  },
};
