# Supabase Adapter Skeleton

This folder is the future home for Supabase Auth, Postgres, and Storage adapters.

Current status:

- No Supabase SDK dependency is installed yet.
- No runtime client is created yet.
- The app continues to run through `mockSessionProvider` and `mockRepositories`.
- Files here document the adapter boundary so the real implementation can be added without changing page-level code.

## Planned files

| File | Purpose |
| --- | --- |
| `env.ts` | Validate Supabase-related environment variables |
| `clients.ts` | Create browser, server, and admin clients after SDK installation |
| `session-provider.ts` | Implement `SessionProvider` using Supabase Auth |
| `repositories.ts` | Implement `AppRepositories` using Supabase/Postgres |
| `storage.ts` | Encapsulate artifact submission storage bucket operations |

## Client separation

- Browser client: reads public URL and anon key only.
- Server client: reads request cookies and anon key for user-scoped operations.
- Admin client: uses service role key for server-only maintenance jobs.

`SUPABASE_SERVICE_ROLE_KEY` must never be imported into client components, browser utilities, or files that can be bundled for the browser.

## Contract boundary

The real implementation must satisfy these existing contracts:

- `SessionProvider` from `src/lib/session-contract.ts`
- `AppRepositories` from `src/lib/repository-contracts.ts`

Pages and server actions should continue to depend on those contracts instead of importing Supabase clients directly.

## First implementation sequence

1. Install Supabase SDK.
2. Add environment validation in `env.ts`.
3. Implement Supabase client factories in `clients.ts`.
4. Implement `supabaseSessionProvider`.
5. Implement users and role assignments repository first.
6. Expand DB-backed repositories by domain area.
