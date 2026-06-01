import "server-only";

import { canAccess as canAccessAssignment } from "@/lib/permissions";
import type {
  AccessDecision,
  AccessTarget,
  AppSession,
  SessionLookupInput,
  SessionProvider,
} from "@/lib/session-contract";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Role, RoleAssignment, ScopeType, User } from "@/lib/types";

type UserRow = {
  id: string;
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

function isRole(value: string | null | undefined): value is Role {
  return roles.includes(value as Role);
}

function isScopeType(value: string): value is ScopeType {
  return scopeTypes.includes(value as ScopeType);
}

function mapUser(row: UserRow): User | null {
  if (!isRole(row.default_role) || row.status !== "active") {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    affiliation: row.affiliation,
    defaultRole: row.default_role,
    status: "active",
  };
}

function mapRoleAssignment(row: RoleAssignmentRow): RoleAssignment | null {
  if (!isRole(row.role) || !isScopeType(row.scope_type)) {
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

function pickActiveAssignment(
  user: User,
  assignments: RoleAssignment[],
  input?: SessionLookupInput,
) {
  const activeAssignments = assignments.filter((assignment) => assignment.status === "active");
  const preferredRole = isRole(input?.roleParam) ? input.roleParam : user.defaultRole;

  return (
    activeAssignments.find((assignment) => assignment.role === preferredRole) ??
    activeAssignments.find((assignment) => assignment.role === user.defaultRole) ??
    activeAssignments[0] ??
    null
  );
}

export const supabaseSessionProvider: SessionProvider = {
  async getCurrentSession(input?: SessionLookupInput): Promise<AppSession | null> {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return null;
    }

    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("id,email,name,affiliation,default_role,status")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    if (userError || !userRow) {
      return null;
    }

    const user = mapUser(userRow);
    if (!user) {
      return null;
    }

    const { data: assignmentRows, error: assignmentsError } = await supabase
      .from("role_assignments")
      .select("id,user_id,role,scope_type,scope_id,status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (assignmentsError || !assignmentRows) {
      return null;
    }

    const assignments = assignmentRows
      .map((assignment) => mapRoleAssignment(assignment))
      .filter((assignment): assignment is RoleAssignment => Boolean(assignment));
    const activeAssignment = pickActiveAssignment(user, assignments, input);

    if (!activeAssignment) {
      return null;
    }

    return {
      user,
      activeRole: activeAssignment.role,
      activeAssignment,
      assignments,
      source: "supabase",
    };
  },
  async requireSession(input?: SessionLookupInput): Promise<AppSession> {
    const session = await this.getCurrentSession(input);

    if (!session) {
      throw new Error("Supabase session could not be resolved.");
    }

    return session;
  },
  async canAccess(session: AppSession, target: AccessTarget): Promise<AccessDecision> {
    const allowed = canAccessAssignment(
      session.activeAssignment,
      target.action,
      target.scopeType,
      target.scopeId,
    );

    return {
      allowed,
      reason: allowed ? undefined : "Active Supabase role assignment does not allow this target scope/action.",
    };
  },
};
