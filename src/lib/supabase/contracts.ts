import type { AppRepositories } from "@/lib/repository-contracts";
import type { SessionProvider } from "@/lib/session-contract";

export type SupabaseAdapterStatus = "planned" | "partial" | "active";

export type SupabaseAuthAdapterPlan = {
  status: SupabaseAdapterStatus;
  providerName: "supabase";
  satisfies: "SessionProvider";
  notes: string[];
};

export type SupabaseRepositoryAdapterPlan = {
  status: SupabaseAdapterStatus;
  providerName: "supabase";
  satisfies: "AppRepositories";
  firstDomains: Array<keyof AppRepositories>;
  notes: string[];
};

export const supabaseAuthAdapterPlan: SupabaseAuthAdapterPlan = {
  status: "partial",
  providerName: "supabase",
  satisfies: "SessionProvider",
  notes: [
    "Resolve the Supabase authenticated user from server cookies.",
    "Map auth.users.id to the app users table through users.auth_user_id.",
    "Load active role assignments from the database.",
    "Return the same AppSession shape used by mockSessionProvider.",
  ],
};

export const supabaseRepositoryAdapterPlan: SupabaseRepositoryAdapterPlan = {
  status: "partial",
  providerName: "supabase",
  satisfies: "AppRepositories",
  firstDomains: ["users", "cohorts", "learning"],
  notes: [
    "Implement users and role assignments first because session resolution depends on them.",
    "Keep pages and server actions depending on AppRepositories rather than Supabase clients.",
    "Move write paths only after read repositories are validated against real tables.",
    "Add Storage only after submissions metadata is persisted in Postgres.",
  ],
};

export type PlannedSupabaseSessionProvider = SessionProvider;
export type PlannedSupabaseRepositories = AppRepositories;
