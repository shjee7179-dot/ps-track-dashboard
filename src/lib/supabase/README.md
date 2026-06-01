# Supabase Adapter Skeleton

This folder is the future home for Supabase Auth, Postgres, and Storage adapters.

Current status:

- `@supabase/supabase-js` and `@supabase/ssr` are installed.
- Runtime client factories exist for browser, server, and admin contexts.
- The app continues to run through `mockSessionProvider` and `mockRepositories`.
- Files here document the adapter boundary so the real implementation can be added without changing page-level code.

## Planned files

| File | Purpose |
| --- | --- |
| `env.ts` | Validate Supabase-related environment variables |
| `database.ts` | Placeholder for generated Supabase database types |
| `clients.ts` | Create browser client from public URL and anon key |
| `server.ts` | Create server and admin clients in server-only context |
| `session-provider.ts` | Implement `SessionProvider` using Supabase Auth and `role_assignments` |
| `repositories.ts` | Implement `AppRepositories` using Supabase/Postgres |
| `storage.ts` | Encapsulate artifact submission storage bucket operations |

## Client separation

- Browser client: reads public URL and anon key only.
- Server client: reads request cookies and anon key for user-scoped operations.
- Admin client: uses service role key for server-only maintenance jobs.

`SUPABASE_SERVICE_ROLE_KEY` must never be imported into client components, browser utilities, or files that can be bundled for the browser.
For that reason, the admin client lives in `server.ts`, which imports `server-only`.

## Contract boundary

The real implementation must satisfy these existing contracts:

- `SessionProvider` from `src/lib/session-contract.ts`
- `AppRepositories` from `src/lib/repository-contracts.ts`

Pages and server actions should continue to depend on those contracts instead of importing Supabase clients directly.

## Session provider draft

`supabaseSessionProvider` currently:

1. Reads the verified Supabase Auth user through `supabase.auth.getUser()`.
2. Resolves the app user by `users.auth_user_id`.
3. Loads role assignments from `role_assignments`.
4. Selects the active assignment by requested role, default role, then first active assignment.
5. Returns the existing `AppSession` contract.

It is not wired as the default provider yet. The app still runs through mock session and mock repositories until provider switching is introduced.

## First implementation sequence

1. Add provider switching for `AUTH_PROVIDER=mock|supabase`.
2. Implement users and role assignments repository first.
3. Generate typed `Database` definitions from the Supabase schema.
4. Add seed/RLS SQL for the core auth/scope tables.
5. Expand DB-backed repositories by domain area.
