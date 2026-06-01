import "server-only";

import { mockSessionProvider } from "@/lib/session";
import { keycloakSessionProvider } from "@/lib/keycloak/session-provider";
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

export const sessionProvider: SessionProvider = {
  async getCurrentSession(input?: SessionLookupInput): Promise<AppSession | null> {
    return getSessionProvider().getCurrentSession(input);
  },
  async requireSession(input?: SessionLookupInput): Promise<AppSession> {
    return getSessionProvider().requireSession(input);
  },
  async canAccess(session: AppSession, target: AccessTarget): Promise<AccessDecision> {
    return getSessionProvider().canAccess(session, target);
  },
};
