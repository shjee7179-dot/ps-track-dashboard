import {
  canAccess,
  getDefaultAssignment,
  getUserById,
  roleAssignments,
  type Role,
  type RoleAssignment,
  type User,
} from "@/lib/domain";
import type {
  AccessDecision,
  AccessTarget,
  AppSession,
  SessionLookupInput,
  SessionProvider,
} from "@/lib/session-contract";

export type MockSession = {
  role: Role;
  user?: User;
  assignment: RoleAssignment;
};

export const defaultMockRole: Role = "admin";

export function isRole(value: string | null | undefined): value is Role {
  return value === "student" || value === "operator" || value === "mentor" || value === "pi" || value === "admin";
}

export function getRoleFromParam(value: string | null | undefined, fallback: Role = defaultMockRole) {
  return isRole(value) ? value : fallback;
}

export function getMockSession(roleValue?: string | null, fallback: Role = defaultMockRole): MockSession {
  const role = getRoleFromParam(roleValue, fallback);
  const assignment = getDefaultAssignment(role);

  return {
    role,
    assignment,
    user: getUserById(assignment.userId),
  };
}

export function getMockAppSession(
  roleValue?: string | null,
  fallback: Role = defaultMockRole,
): AppSession | null {
  const role = getRoleFromParam(roleValue, fallback);
  const assignment = getDefaultAssignment(role);
  const user = getUserById(assignment.userId);
  if (!user) return null;

  return {
    user,
    activeRole: role,
    activeAssignment: assignment,
    assignments: roleAssignments.filter((item) => item.userId === user.id),
    source: "mock",
  };
}

export const mockSessionProvider: SessionProvider = {
  async getCurrentSession(input?: SessionLookupInput) {
    return getMockAppSession(input?.roleParam);
  },
  async requireSession(input?: SessionLookupInput) {
    const session = getMockAppSession(input?.roleParam);
    if (!session) {
      throw new Error("Mock session could not be resolved.");
    }
    return session;
  },
  async canAccess(session: AppSession, target: AccessTarget): Promise<AccessDecision> {
    const allowed = canAccess(
      session.activeAssignment,
      target.action,
      target.scopeType,
      target.scopeId,
    );

    return {
      allowed,
      reason: allowed ? undefined : "Active role assignment does not allow this target scope/action.",
    };
  },
};

export function withRoleQuery(href: string, role: Role) {
  return `${href}${href.includes("?") ? "&" : "?"}role=${role}`;
}
