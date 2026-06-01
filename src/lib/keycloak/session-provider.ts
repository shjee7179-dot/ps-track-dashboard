import "server-only";

import { headers } from "next/headers";

import { canAccess as canAccessAssignment } from "@/lib/permissions";
import { repositories } from "@/lib/repositories";
import type {
  AccessDecision,
  AccessTarget,
  AppSession,
  SessionLookupInput,
  SessionProvider,
} from "@/lib/session-contract";
import { isRole } from "@/lib/session";
import type { RoleAssignment, User } from "@/lib/types";

const defaultSubjectHeader = "x-keycloak-sub";
const defaultUsernameHeader = "x-keycloak-preferred-username";
const defaultEmailHeader = "x-keycloak-email";

function getHeaderName(envName: string, fallback: string) {
  return process.env[envName]?.trim() || fallback;
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

async function getExternalSubjectFromTrustedHeaders() {
  const requestHeaders = await headers();
  return requestHeaders.get(getHeaderName("KEYCLOAK_SUB_HEADER", defaultSubjectHeader));
}

export async function getKeycloakHeaderSnapshot() {
  const requestHeaders = await headers();

  return {
    subject: requestHeaders.get(getHeaderName("KEYCLOAK_SUB_HEADER", defaultSubjectHeader)),
    username: requestHeaders.get(getHeaderName("KEYCLOAK_USERNAME_HEADER", defaultUsernameHeader)),
    email: requestHeaders.get(getHeaderName("KEYCLOAK_EMAIL_HEADER", defaultEmailHeader)),
  };
}

export const keycloakSessionProvider: SessionProvider = {
  async getCurrentSession(input?: SessionLookupInput): Promise<AppSession | null> {
    const externalSubject = await getExternalSubjectFromTrustedHeaders();
    if (!externalSubject) {
      return null;
    }

    const user = await repositories.users.getUserByExternalSubject(externalSubject);
    if (!user || user.status !== "active") {
      return null;
    }

    const assignments = await repositories.users.listRoleAssignments(user.id);
    const activeAssignment = pickActiveAssignment(user, assignments, input);
    if (!activeAssignment) {
      return null;
    }

    return {
      user,
      activeRole: activeAssignment.role,
      activeAssignment,
      assignments,
      source: "keycloak",
    };
  },
  async requireSession(input?: SessionLookupInput): Promise<AppSession> {
    const session = await this.getCurrentSession(input);

    if (!session) {
      throw new Error("Keycloak session could not be resolved from trusted headers.");
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
      reason: allowed ? undefined : "Active Keycloak role assignment does not allow this target scope/action.",
    };
  },
};
