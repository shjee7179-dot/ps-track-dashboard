import {
  getDefaultAssignment,
  getUserById,
  type Role,
  type RoleAssignment,
  type User,
} from "@/lib/domain";

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

export function withRoleQuery(href: string, role: Role) {
  return `${href}${href.includes("?") ? "&" : "?"}role=${role}`;
}
