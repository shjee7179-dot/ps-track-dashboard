import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import type { Database } from "@/lib/supabase/database";
import {
  getSupabaseAdminEnv,
  getSupabasePublicEnv,
} from "@/lib/supabase/env";

export async function createSupabaseServerClient(): Promise<SupabaseClient<Database>> {
  const { url, anonKey } = getSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components cannot always write cookies. Middleware or server
          // actions should refresh auth cookies before response streaming.
        }
      },
    },
  });
}

export function createSupabaseAdminClient(): SupabaseClient<Database> {
  const { url, serviceRoleKey } = getSupabaseAdminEnv();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
