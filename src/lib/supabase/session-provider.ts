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
import { isSupabaseRole, supabaseUserRepository } from "@/lib/supabase/repositories";
import type { RoleAssignment, User } from "@/lib/types";

function pickActiveAssignment(
  user: User,
  assignments: RoleAssignment[],
  input?: SessionLookupInput,
) {
  const activeAssignments = assignments.filter((assignment) => assignment.status === "active");
  const preferredRole = isSupabaseRole(input?.roleParam) ? input.roleParam : user.defaultRole;

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

    const { data: authLink, error: authLinkError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    if (authLinkError || !authLink) {
      return null;
    }

    const user = await supabaseUserRepository.getUserById(authLink.id);
    if (!user) {
      return null;
    }

    const assignments = await supabaseUserRepository.listRoleAssignments(user.id);
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
