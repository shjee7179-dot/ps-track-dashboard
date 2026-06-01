-- Core auth/scope RLS draft
-- Purpose: establish the first authorization shape for Supabase Auth MVP.
-- Server actions should continue to enforce application-level permission checks.

alter table public.users enable row level security;
alter table public.programs enable row level security;
alter table public.cohorts enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.role_assignments enable row level security;

create or replace function public.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select users.id
  from public.users
  where users.auth_user_id = auth.uid()
    and users.status = 'active'
  limit 1
$$;

create or replace function public.has_active_role(
  target_role text,
  target_scope_type text,
  target_scope_id text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.role_assignments
    where role_assignments.user_id = public.current_app_user_id()
      and role_assignments.role = target_role
      and role_assignments.scope_type = target_scope_type
      and role_assignments.scope_id = target_scope_id
      and role_assignments.status = 'active'
  )
$$;

create or replace function public.is_system_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_active_role('admin', 'system', 'system')
$$;

create or replace function public.can_read_scope(
  target_scope_type text,
  target_scope_id text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_system_admin()
    or public.has_active_role('operator', 'cohort', target_scope_id)
    or public.has_active_role('mentor', 'team', target_scope_id)
    or public.has_active_role('pi', 'program', target_scope_id)
    or (
      target_scope_type = 'student'
      and target_scope_id = public.current_app_user_id()::text
    )
$$;

drop policy if exists users_read_self_or_admin on public.users;
create policy users_read_self_or_admin
on public.users
for select
to authenticated
using (
  id = public.current_app_user_id()
  or public.is_system_admin()
);

drop policy if exists role_assignments_read_self_or_admin on public.role_assignments;
create policy role_assignments_read_self_or_admin
on public.role_assignments
for select
to authenticated
using (
  user_id = public.current_app_user_id()
  or public.is_system_admin()
);

drop policy if exists programs_read_by_pi_or_admin on public.programs;
create policy programs_read_by_pi_or_admin
on public.programs
for select
to authenticated
using (
  public.is_system_admin()
  or public.has_active_role('pi', 'program', id::text)
);

drop policy if exists cohorts_read_by_operator_or_admin on public.cohorts;
create policy cohorts_read_by_operator_or_admin
on public.cohorts
for select
to authenticated
using (
  public.is_system_admin()
  or public.has_active_role('operator', 'cohort', id::text)
  or public.has_active_role('pi', 'program', program_id::text)
);

drop policy if exists teams_read_by_scope on public.teams;
create policy teams_read_by_scope
on public.teams
for select
to authenticated
using (
  public.is_system_admin()
  or public.has_active_role('mentor', 'team', id::text)
  or public.has_active_role('operator', 'cohort', cohort_id::text)
);

drop policy if exists team_members_read_by_scope on public.team_members;
create policy team_members_read_by_scope
on public.team_members
for select
to authenticated
using (
  user_id = public.current_app_user_id()
  or public.is_system_admin()
  or exists (
    select 1
    from public.teams
    where teams.id = team_members.team_id
      and (
        public.has_active_role('mentor', 'team', teams.id::text)
        or public.has_active_role('operator', 'cohort', teams.cohort_id::text)
      )
  )
);

-- Write policies are intentionally omitted in the first draft.
-- Mutations should go through server actions and a server-only Supabase client
-- until each write path has a concrete permission test and audit trail.
