import type { Action, Role, RoleAssignment, ScopeType, User } from "@/lib/types";

export type SessionSource = "mock" | "supabase";

export type AppSession = {
  user: User;
  activeRole: Role;
  activeAssignment: RoleAssignment;
  assignments: RoleAssignment[];
  source: SessionSource;
};

export type SessionLookupInput = {
  roleParam?: string | null;
};

export type AccessTarget = {
  scopeType: ScopeType;
  scopeId: string;
  action: Action;
};

export type AccessDecision = {
  allowed: boolean;
  reason?: string;
};

export type SessionProvider = {
  getCurrentSession(input?: SessionLookupInput): Promise<AppSession | null>;
  requireSession(input?: SessionLookupInput): Promise<AppSession>;
  canAccess(session: AppSession, target: AccessTarget): Promise<AccessDecision>;
};
