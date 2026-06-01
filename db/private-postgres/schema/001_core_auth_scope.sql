-- Private PostgreSQL core auth/scope schema
-- Purpose: define the first production-oriented table shape for
-- AlphaCampus/Keycloak auth + independent PS Track PostgreSQL.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  external_subject text unique,
  email text not null unique,
  name text not null,
  affiliation text not null default '',
  default_role text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_default_role_check
    check (default_role in ('student', 'operator', 'mentor', 'pi', 'admin')),
  constraint users_status_check
    check (status in ('active', 'inactive'))
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null default '',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint programs_status_check
    check (status in ('draft', 'active', 'closed'))
);

create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete restrict,
  code text not null unique,
  name text not null,
  year int not null,
  agreement_date date,
  starts_at date not null,
  ends_at date not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cohorts_status_check
    check (status in ('draft', 'active', 'closed')),
  constraint cohorts_date_range_check
    check (ends_at >= starts_at)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  name text not null,
  topic text not null default '',
  mentor_id uuid references public.users(id) on delete set null,
  status text not null default 'forming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teams_status_check
    check (status in ('forming', 'active', 'closed'))
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_members_role_check
    check (role in ('member', 'leader')),
  constraint team_members_status_check
    check (status in ('active', 'inactive')),
  constraint team_members_team_user_unique
    unique (team_id, user_id)
);

create table if not exists public.role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null,
  scope_type text not null,
  scope_id text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint role_assignments_role_check
    check (role in ('student', 'operator', 'mentor', 'pi', 'admin')),
  constraint role_assignments_scope_type_check
    check (scope_type in ('system', 'program', 'cohort', 'track', 'team', 'student')),
  constraint role_assignments_status_check
    check (status in ('active', 'inactive')),
  constraint role_assignments_date_range_check
    check (ends_at is null or ends_at > starts_at)
);

create unique index if not exists role_assignments_active_unique
  on public.role_assignments (user_id, role, scope_type, scope_id)
  where status = 'active';

create index if not exists users_external_subject_idx
  on public.users (external_subject);

create index if not exists users_email_idx
  on public.users (email);

create index if not exists cohorts_program_status_idx
  on public.cohorts (program_id, status);

create index if not exists teams_cohort_status_idx
  on public.teams (cohort_id, status);

create index if not exists teams_mentor_id_idx
  on public.teams (mentor_id);

create index if not exists team_members_user_status_idx
  on public.team_members (user_id, status);

create index if not exists role_assignments_user_status_idx
  on public.role_assignments (user_id, status);

create index if not exists role_assignments_scope_status_idx
  on public.role_assignments (scope_type, scope_id, status);

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_programs_updated_at on public.programs;
create trigger set_programs_updated_at
before update on public.programs
for each row execute function public.set_updated_at();

drop trigger if exists set_cohorts_updated_at on public.cohorts;
create trigger set_cohorts_updated_at
before update on public.cohorts
for each row execute function public.set_updated_at();

drop trigger if exists set_teams_updated_at on public.teams;
create trigger set_teams_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

drop trigger if exists set_team_members_updated_at on public.team_members;
create trigger set_team_members_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

drop trigger if exists set_role_assignments_updated_at on public.role_assignments;
create trigger set_role_assignments_updated_at
before update on public.role_assignments
for each row execute function public.set_updated_at();

comment on table public.users is
  'Application domain users for PS Track. Keycloak or AlphaCampus identity is linked through external_subject.';

comment on column public.users.external_subject is
  'Verified Keycloak subject or AlphaCampus user identifier received through the auth boundary.';

comment on table public.role_assignments is
  'Role plus scope assignments used by SessionProvider and permission checks.';

comment on column public.role_assignments.scope_id is
  'Text by design because scope targets are polymorphic: system, program, cohort, track, team, or student.';
