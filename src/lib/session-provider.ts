import "server-only";

import { headers } from "next/headers";

import { mockSessionProvider } from "@/lib/session";
import { keycloakSessionProvider } from "@/lib/keycloak/session-provider";
import { repositories } from "@/lib/repositories";
import type {
  AccessDecision,
  AccessTarget,
  AppSession,
  SessionLookupInput,
  SessionProvider,
} from "@/lib/session-contract";
import { supabaseSessionProvider } from "@/lib/supabase/session-provider";

export type AuthProviderName = "mock" | "supabase" | "keycloak";

export function getAuthProviderName(value = process.env.AUTH_PROVIDER): AuthProviderName {
  if (!value || value === "mock") {
    return "mock";
  }
  if (value === "supabase") {
    return "supabase";
  }
  if (value === "keycloak") {
    return "keycloak";
  }

  throw new Error(`Unsupported AUTH_PROVIDER value: ${value}`);
}

export function getSessionProvider(): SessionProvider {
  const providerName = getAuthProviderName();
  if (providerName === "supabase") {
    return supabaseSessionProvider;
  }
  if (providerName === "keycloak") {
    return keycloakSessionProvider;
  }
  return mockSessionProvider;
}

function normalizeForwardedIp(value: string | null) {
  const firstValue = value?.split(",")[0]?.trim();
  if (!firstValue) return undefined;
  return /^[0-9a-fA-F:.]+$/.test(firstValue) ? firstValue : undefined;
}

function buildSessionAccessTarget(session: AppSession) {
  return `${session.activeRole} / ${session.activeAssignment.scopeType}:${session.activeAssignment.scopeId}`;
}

async function recordSessionAccess(session: AppSession, input?: SessionLookupInput) {
  try {
    const requestHeaders = await headers();
    const requestedRole = input?.roleParam?.trim();
    const event = requestedRole && requestedRole !== session.user.defaultRole ? "역할 선택" : "세션 확인";

    await repositories.admin.createAccessLog({
      actorId: session.user.id,
      actorLabel: session.user.name,
      event,
      targetType: "role",
      targetId: session.activeRole,
      targetLabel: buildSessionAccessTarget(session),
      severity: "info",
      ipAddress: normalizeForwardedIp(
        requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip"),
      ),
      userAgent: requestHeaders.get("user-agent") ?? undefined,
      sessionId: `${session.source}:${session.user.id}:${session.activeRole}`,
      metadata: {
        source: session.source,
        requestedRole: requestedRole || null,
        assignmentId: session.activeAssignment.id,
      },
    });
  } catch {
    // Access logging is best-effort in MVP so domain actions are not blocked by log storage outages.
  }
}

export const sessionProvider: SessionProvider = {
  async getCurrentSession(input?: SessionLookupInput): Promise<AppSession | null> {
    return getSessionProvider().getCurrentSession(input);
  },
  async requireSession(input?: SessionLookupInput): Promise<AppSession> {
    const session = await getSessionProvider().requireSession(input);
    await recordSessionAccess(session, input);
    return session;
  },
  async canAccess(session: AppSession, target: AccessTarget): Promise<AccessDecision> {
    return getSessionProvider().canAccess(session, target);
  },
};
