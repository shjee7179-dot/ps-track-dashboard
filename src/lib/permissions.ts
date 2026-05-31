import { roleAssignments, routeAccessPolicies } from "@/lib/mock-data";
import type { Action, Role, RoleAssignment, ScopeType } from "@/lib/types";

export function canAccess(
  assignment: RoleAssignment,
  action: Action,
  targetScopeType: ScopeType,
  targetScopeId: string,
) {
  if (assignment.status !== "active") return false;
  if (assignment.role === "admin" && assignment.scopeType === "system") {
    return true;
  }
  if (action === "delete" && assignment.role !== "admin") return false;
  if (assignment.scopeType === targetScopeType && assignment.scopeId === targetScopeId) {
    return true;
  }
  if (assignment.role === "operator" && targetScopeType !== "system") {
    return assignment.scopeType === "cohort";
  }
  if (assignment.role === "pi" && action === "read") {
    return ["program", "cohort", "team", "student"].includes(targetScopeType);
  }
  return false;
}

export function getDefaultAssignment(role: Role) {
  return roleAssignments.find((assignment) => assignment.role === role) ?? roleAssignments[0];
}

export function getRouteAccessPolicy(pathname: string) {
  return routeAccessPolicies
    .filter((policy) => pathname === policy.href || pathname.startsWith(`${policy.href}/`))
    .sort((first, second) => second.href.length - first.href.length)[0];
}

export function canAccessRoute(role: Role, href: string) {
  const policy = getRouteAccessPolicy(href);
  const assignment = getDefaultAssignment(role);

  if (!policy || !policy.roles.includes(role)) return false;
  if (assignment.status !== "active") return false;
  if (policy.targetScopeType === "system") {
    return canAccess(assignment, "read", policy.targetScopeType, policy.targetScopeId);
  }
  if (["operator", "pi", "admin"].includes(role)) {
    return canAccess(assignment, "read", policy.targetScopeType, policy.targetScopeId);
  }
  if (role === "student") {
    return ["program", "cohort", "student"].includes(policy.targetScopeType);
  }
  if (role === "mentor") {
    return ["program", "cohort", "team", "student"].includes(policy.targetScopeType);
  }
  return false;
}

export function canAccessPath(role: Role, pathname: string) {
  return canAccessRoute(role, pathname);
}

export function getAccessibleNavItems(role: Role) {
  return routeAccessPolicies.filter((policy) => canAccessRoute(role, policy.href));
}
