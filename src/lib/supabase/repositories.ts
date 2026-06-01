import "server-only";

import { mockRepositories } from "@/lib/mock-repositories";
import type { UserRepository } from "@/lib/repository-contracts";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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

export function isSupabaseRole(value: string | null | undefined): value is Role {
  return roles.includes(value as Role);
}

export function isSupabaseScopeType(value: string): value is ScopeType {
  return scopeTypes.includes(value as ScopeType);
}

export function mapSupabaseUser(row: UserRow): User | null {
  if (!isSupabaseRole(row.default_role)) {
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

export function mapSupabaseRoleAssignment(row: RoleAssignmentRow): RoleAssignment | null {
  if (!isSupabaseRole(row.role) || !isSupabaseScopeType(row.scope_type)) {
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

export const supabaseUserRepository: UserRepository = {
  async listUsers(query) {
    const supabase = await createSupabaseServerClient();
    let request = supabase
      .from("users")
      .select("id,external_subject,email,name,affiliation,default_role,status")
      .order("name", { ascending: true });

    if (query?.limit) {
      request = request.limit(query.limit);
    }

    const { data, error } = await request;
    if (error || !data) {
      return [];
    }

    return data
      .map((row) => mapSupabaseUser(row))
      .filter((user): user is User => Boolean(user));
  },
  async getUserById(userId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("users")
      .select("id,external_subject,email,name,affiliation,default_role,status")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) {
      return undefined;
    }

    return mapSupabaseUser(data) ?? undefined;
  },
  async getUserByExternalSubject(externalSubject) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("users")
      .select("id,external_subject,email,name,affiliation,default_role,status")
      .eq("external_subject", externalSubject)
      .maybeSingle();

    if (error || !data) {
      return undefined;
    }

    return mapSupabaseUser(data) ?? undefined;
  },
  async listRoleAssignments(userId) {
    const supabase = await createSupabaseServerClient();
    let request = supabase
      .from("role_assignments")
      .select("id,user_id,role,scope_type,scope_id,status")
      .order("created_at", { ascending: true });

    if (userId) {
      request = request.eq("user_id", userId);
    }

    const { data, error } = await request;
    if (error || !data) {
      return [];
    }

    return data
      .map((row) => mapSupabaseRoleAssignment(row))
      .filter((assignment): assignment is RoleAssignment => Boolean(assignment));
  },
};

export const supabaseRepositories = {
  ...mockRepositories,
  users: supabaseUserRepository,
};
