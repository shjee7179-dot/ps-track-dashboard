-- Private PostgreSQL core auth/scope seed
-- Purpose: provide minimal rows for validating Keycloak external subject
-- mapping and role/scope assignments in a private PostgreSQL runtime.

with program_row as (
  insert into public.programs (code, name, description, status)
  values (
    'program-ps-track',
    '미래 의사과학자 챌린지 트랙',
    '학생 개인 기준 학습 여정과 산출물/성과를 관리하는 2026 MVP 프로그램',
    'active'
  )
  on conflict (code) do update
    set name = excluded.name,
        description = excluded.description,
        status = excluded.status,
        updated_at = now()
  returning id
),
cohort_row as (
  insert into public.cohorts (
    program_id,
    code,
    name,
    year,
    agreement_date,
    starts_at,
    ends_at,
    status
  )
  select
    id,
    'cohort-2026-1',
    '2026년 1기',
    2026,
    date '2026-06-01',
    date '2026-07-01',
    date '2026-10-31',
    'draft'
  from program_row
  on conflict (code) do update
    set name = excluded.name,
        year = excluded.year,
        agreement_date = excluded.agreement_date,
        starts_at = excluded.starts_at,
        ends_at = excluded.ends_at,
        status = excluded.status,
        updated_at = now()
  returning id
),
student_user as (
  insert into public.users (
    external_subject,
    email,
    name,
    affiliation,
    default_role,
    status
  )
  values (
    'keycloak:student-001',
    'student@example.kr',
    '김서연',
    '예비 의사과학자',
    'student',
    'active'
  )
  on conflict (email) do update
    set external_subject = excluded.external_subject,
        name = excluded.name,
        affiliation = excluded.affiliation,
        default_role = excluded.default_role,
        status = excluded.status,
        updated_at = now()
  returning id
),
operator_user as (
  insert into public.users (
    external_subject,
    email,
    name,
    affiliation,
    default_role,
    status
  )
  values (
    'keycloak:operator-001',
    'operator@example.kr',
    '운영자',
    '프로그램 운영팀',
    'operator',
    'active'
  )
  on conflict (email) do update
    set external_subject = excluded.external_subject,
        name = excluded.name,
        affiliation = excluded.affiliation,
        default_role = excluded.default_role,
        status = excluded.status,
        updated_at = now()
  returning id
),
mentor_user as (
  insert into public.users (
    external_subject,
    email,
    name,
    affiliation,
    default_role,
    status
  )
  values (
    'keycloak:mentor-001',
    'mentor@example.kr',
    '이멘토',
    '연구 멘토단',
    'mentor',
    'active'
  )
  on conflict (email) do update
    set external_subject = excluded.external_subject,
        name = excluded.name,
        affiliation = excluded.affiliation,
        default_role = excluded.default_role,
        status = excluded.status,
        updated_at = now()
  returning id
),
pi_user as (
  insert into public.users (
    external_subject,
    email,
    name,
    affiliation,
    default_role,
    status
  )
  values (
    'keycloak:pi-001',
    'pi@example.kr',
    '박책임',
    '연구책임자',
    'pi',
    'active'
  )
  on conflict (email) do update
    set external_subject = excluded.external_subject,
        name = excluded.name,
        affiliation = excluded.affiliation,
        default_role = excluded.default_role,
        status = excluded.status,
        updated_at = now()
  returning id
),
admin_user as (
  insert into public.users (
    external_subject,
    email,
    name,
    affiliation,
    default_role,
    status
  )
  values (
    'keycloak:admin-001',
    'admin@example.kr',
    '시스템 총괄',
    '시스템 관리',
    'admin',
    'active'
  )
  on conflict (email) do update
    set external_subject = excluded.external_subject,
        name = excluded.name,
        affiliation = excluded.affiliation,
        default_role = excluded.default_role,
        status = excluded.status,
        updated_at = now()
  returning id
),
team_insert as (
  insert into public.teams (
    cohort_id,
    name,
    topic,
    mentor_id,
    status
  )
  select
    cohort_row.id,
    '바이오메디컬 질문 설계팀',
    '청소년 의사과학자 관점의 임상 연구 질문 설계',
    mentor_user.id,
    'active'
  from cohort_row, mentor_user
  where not exists (
    select 1
    from public.teams
    where teams.cohort_id = cohort_row.id
      and teams.name = '바이오메디컬 질문 설계팀'
  )
  returning id
),
team_row as (
  select id from team_insert
  union all
  select teams.id
  from public.teams
  join cohort_row on cohort_row.id = teams.cohort_id
  where teams.name = '바이오메디컬 질문 설계팀'
  limit 1
)
insert into public.team_members (team_id, user_id, role, status)
select team_row.id, student_user.id, 'leader', 'active'
from team_row, student_user
on conflict (team_id, user_id) do update
  set role = excluded.role,
      status = excluded.status,
      updated_at = now();

insert into public.role_assignments (
  user_id,
  role,
  scope_type,
  scope_id,
  status
)
select users.id, 'student', 'student', users.id::text, 'active'
from public.users
where users.email = 'student@example.kr'
on conflict (user_id, role, scope_type, scope_id) where status = 'active'
do update set status = excluded.status, updated_at = now();

insert into public.role_assignments (
  user_id,
  role,
  scope_type,
  scope_id,
  status
)
select users.id, 'operator', 'cohort', cohorts.id::text, 'active'
from public.users
cross join public.cohorts
where users.email = 'operator@example.kr'
  and cohorts.code = 'cohort-2026-1'
on conflict (user_id, role, scope_type, scope_id) where status = 'active'
do update set status = excluded.status, updated_at = now();

insert into public.role_assignments (
  user_id,
  role,
  scope_type,
  scope_id,
  status
)
select users.id, 'mentor', 'team', teams.id::text, 'active'
from public.users
cross join public.teams
where users.email = 'mentor@example.kr'
  and teams.name = '바이오메디컬 질문 설계팀'
on conflict (user_id, role, scope_type, scope_id) where status = 'active'
do update set status = excluded.status, updated_at = now();

insert into public.role_assignments (
  user_id,
  role,
  scope_type,
  scope_id,
  status
)
select users.id, 'pi', 'program', programs.id::text, 'active'
from public.users
cross join public.programs
where users.email = 'pi@example.kr'
  and programs.code = 'program-ps-track'
on conflict (user_id, role, scope_type, scope_id) where status = 'active'
do update set status = excluded.status, updated_at = now();

insert into public.role_assignments (
  user_id,
  role,
  scope_type,
  scope_id,
  status
)
select users.id, 'admin', 'system', 'system', 'active'
from public.users
where users.email = 'admin@example.kr'
on conflict (user_id, role, scope_type, scope_id) where status = 'active'
do update set status = excluded.status, updated_at = now();
