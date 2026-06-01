import "server-only";

import { mockRepositories } from "@/lib/mock-repositories";
import { queryPostgres } from "@/lib/postgres/client";
import type { UserRepository } from "@/lib/repository-contracts";
import type { Role, RoleAssignment, ScopeType, User } from "@/lib/types";

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

const roles: Role[] = ["student", "operator", "mentor", "pi", "admin"];
const scopeTypes: ScopeType[] = ["system", "program", "cohort", "track", "team", "student"];

function isPostgresRole(value: string | null | undefined): value is Role {
  return roles.includes(value as Role);
}

function isPostgresScopeType(value: string): value is ScopeType {
  return scopeTypes.includes(value as ScopeType);
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

const userSelect = `
  select id, external_subject, email, name, affiliation, default_role, status
  from public.users
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

export const postgresRepositories = {
  ...mockRepositories,
  users: postgresUserRepository,
};
