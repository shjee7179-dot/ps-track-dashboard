import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient<Database> | undefined;

export function createSupabaseBrowserClient(): SupabaseClient<Database> {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabasePublicEnv();
  browserClient = createBrowserClient<Database>(url, anonKey);

  return browserClient;
}
