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

create table if not exists public.modules (
  id text primary key,
  title text not null,
  description text not null default '',
  order_index int not null default 0,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint modules_status_check
    check (status in ('draft', 'open', 'closed'))
);

create table if not exists public.contents (
  id text primary key,
  module_id text not null references public.modules(id) on delete cascade,
  title text not null,
  content_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contents_content_type_check
    check (content_type in (
      'video',
      'reading',
      'workshop',
      'assignment',
      'practice',
      'link',
      'offline',
      'mentoring_guide'
    ))
);

create table if not exists public.learning_pieces (
  id text primary key,
  module_id text not null references public.modules(id) on delete cascade,
  content_id text references public.contents(id) on delete set null,
  title text not null,
  piece_type text not null,
  completion_rule text not null default '',
  opens_at date not null,
  due_at date not null,
  requires_submission boolean not null default false,
  requires_approval boolean not null default false,
  requires_evaluation boolean not null default false,
  outcome_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_pieces_piece_type_check
    check (piece_type in (
      'reading',
      'video',
      'workshop',
      'assignment',
      'mentoring',
      'practice',
      'mid_artifact',
      'final_artifact',
      'survey'
    )),
  constraint learning_pieces_date_range_check
    check (due_at >= opens_at)
);

create table if not exists public.learning_piece_statuses (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete cascade,
  learning_piece_id text not null,
  status text not null default 'not_started',
  completed_at date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_piece_statuses_status_check
    check (status in (
      'locked',
      'not_started',
      'in_progress',
      'needs_submission',
      'pending_review',
      'revising',
      'pending_evaluation',
      'completed',
      'delayed'
    )),
  constraint learning_piece_statuses_student_piece_unique
    unique (student_id, learning_piece_id)
);

create table if not exists public.artifacts (
  id text primary key,
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  artifact_type text not null,
  title text not null,
  owner_type text not null,
  owner_id text not null,
  learning_piece_id text references public.learning_pieces(id) on delete set null,
  status text not null default 'not_started',
  due_at date not null,
  final_confirmed boolean not null default false,
  outcome_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint artifacts_artifact_type_check
    check (artifact_type in ('profile', 'literature_log', 'research_plan', 'presentation', 'final_report')),
  constraint artifacts_owner_type_check
    check (owner_type in ('student', 'team')),
  constraint artifacts_status_check
    check (status in (
      'not_started',
      'drafting',
      'submitted',
      'in_review',
      'revision_requested',
      'pending_evaluation',
      'evaluated',
      'final_confirmed'
    ))
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  artifact_id text not null references public.artifacts(id) on delete cascade,
  submitted_by text not null,
  version int not null,
  submitted_at timestamptz not null default now(),
  file_name text,
  external_url text,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint submissions_artifact_version_unique
    unique (artifact_id, version),
  constraint submissions_file_or_url_check
    check (file_name is not null or external_url is not null)
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  artifact_id text references public.artifacts(id) on delete cascade,
  mentoring_session_id text,
  author_id text not null,
  target_user_id text,
  target_team_id text,
  body text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint feedback_status_check
    check (status in ('open', 'resolved')),
  constraint feedback_target_check
    check (target_user_id is not null or target_team_id is not null)
);

create table if not exists public.mentoring_sessions (
  id text primary key,
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  target_type text not null,
  target_id text not null,
  mentor_id text not null,
  scheduled_at text not null,
  status text not null default 'scheduled',
  external_meeting_url text,
  notes text not null default '',
  linked_artifact_id text references public.artifacts(id) on delete set null,
  next_actions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mentoring_sessions_target_type_check
    check (target_type in ('student', 'team')),
  constraint mentoring_sessions_status_check
    check (status in ('scheduled', 'completed', 'absent', 'cancelled'))
);

create table if not exists public.risk_signals (
  id text primary key,
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  target_type text not null,
  target_id text not null,
  risk_type text not null,
  severity text not null,
  related_object_type text not null,
  related_object_id text not null,
  action_status text not null default 'open',
  action_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint risk_signals_target_type_check
    check (target_type in ('student', 'team')),
  constraint risk_signals_risk_type_check
    check (risk_type in ('learning_piece_delay', 'artifact_missing', 'mentoring_issue')),
  constraint risk_signals_severity_check
    check (severity in ('low', 'medium', 'high')),
  constraint risk_signals_related_object_type_check
    check (related_object_type in ('learning_piece', 'artifact', 'mentoring_session')),
  constraint risk_signals_action_status_check
    check (action_status in ('open', 'in_progress', 'resolved'))
);

create table if not exists public.reminder_candidates (
  id text primary key,
  risk_signal_id text not null references public.risk_signals(id) on delete cascade,
  target_type text not null,
  target_id text not null,
  reason text not null,
  channel text not null,
  send_status text not null default 'pending',
  recommended_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reminder_candidates_target_type_check
    check (target_type in ('student', 'team')),
  constraint reminder_candidates_channel_check
    check (channel in ('email', 'sms', 'kakao', 'manual')),
  constraint reminder_candidates_send_status_check
    check (send_status in ('pending', 'sent', 'skipped'))
);

create table if not exists public.learning_outcomes (
  id text primary key,
  code text not null unique,
  title text not null,
  description text not null default '',
  category text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_outcomes_category_check
    check (category in ('research_foundation', 'research_design', 'communication', 'career'))
);

create table if not exists public.rubrics (
  id text primary key,
  artifact_type text not null,
  title text not null,
  max_score int not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rubrics_artifact_type_check
    check (artifact_type in ('profile', 'literature_log', 'research_plan', 'presentation', 'final_report')),
  constraint rubrics_status_check
    check (status in ('draft', 'active', 'archived')),
  constraint rubrics_max_score_check
    check (max_score > 0)
);

create table if not exists public.rubric_items (
  id text primary key,
  rubric_id text not null references public.rubrics(id) on delete cascade,
  title text not null,
  description text not null default '',
  max_score int not null,
  outcome_ids text[] not null default '{}',
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rubric_items_max_score_check
    check (max_score > 0)
);

create table if not exists public.evaluations (
  id text primary key default gen_random_uuid()::text,
  artifact_id text not null references public.artifacts(id) on delete cascade,
  rubric_id text not null references public.rubrics(id) on delete restrict,
  evaluator_id text not null,
  evaluated_at timestamptz not null default now(),
  total_score int not null,
  max_score int not null,
  overall_comment text not null default '',
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint evaluations_status_check
    check (status in ('draft', 'submitted')),
  constraint evaluations_score_range_check
    check (total_score >= 0 and max_score > 0 and total_score <= max_score)
);

create table if not exists public.evaluation_item_scores (
  id text primary key default gen_random_uuid()::text,
  evaluation_id text not null references public.evaluations(id) on delete cascade,
  rubric_item_id text not null references public.rubric_items(id) on delete restrict,
  score int not null,
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint evaluation_item_scores_score_check
    check (score >= 0),
  constraint evaluation_item_scores_evaluation_item_unique
    unique (evaluation_id, rubric_item_id)
);

create table if not exists public.outcome_evidence (
  id text primary key default gen_random_uuid()::text,
  outcome_id text not null references public.learning_outcomes(id) on delete cascade,
  student_id text not null,
  source_type text not null,
  source_id text not null,
  evidence_label text not null,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint outcome_evidence_source_type_check
    check (source_type in ('learning_piece', 'artifact', 'evaluation', 'feedback'))
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id text,
  actor_label text not null,
  event text not null,
  target_type text not null,
  target_id text not null,
  target_label text not null,
  severity text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint audit_logs_severity_check
    check (severity in ('info', 'notice', 'warning'))
);

create table if not exists public.access_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id text,
  actor_label text not null,
  event text not null,
  target_type text not null,
  target_id text not null,
  target_label text not null,
  severity text not null,
  ip_address inet,
  user_agent text,
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint access_logs_severity_check
    check (severity in ('info', 'notice', 'warning'))
);

create table if not exists public.lms_content_mappings (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  module_id text not null,
  content_id text not null,
  learning_piece_id text not null,
  lms_content_id text not null,
  lms_course_round_id text,
  content_group text not null,
  content_type text not null,
  required boolean not null default true,
  activation_rule text not null default 'record_exists',
  status text not null default 'draft',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lms_content_mappings_content_group_check
    check (content_group in ('regular', 'subscription', 'community')),
  constraint lms_content_mappings_content_type_check
    check (content_type in (
      'offline',
      'realtime',
      'hyflex',
      'online',
      'knowledge',
      'ebook',
      'learning_group',
      'seminar'
    )),
  constraint lms_content_mappings_activation_rule_check
    check (activation_rule in ('record_exists', 'participation_active', 'completion_completed')),
  constraint lms_content_mappings_status_check
    check (status in ('draft', 'active', 'inactive')),
  constraint lms_content_mappings_learning_piece_unique
    unique (cohort_id, learning_piece_id)
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

create index if not exists modules_status_order_idx
  on public.modules (status, order_index);

create index if not exists contents_module_idx
  on public.contents (module_id);

create index if not exists learning_pieces_module_idx
  on public.learning_pieces (module_id);

create index if not exists learning_pieces_content_idx
  on public.learning_pieces (content_id);

create index if not exists learning_pieces_due_at_idx
  on public.learning_pieces (due_at);

create index if not exists learning_piece_statuses_student_idx
  on public.learning_piece_statuses (student_id);

create index if not exists learning_piece_statuses_learning_piece_idx
  on public.learning_piece_statuses (learning_piece_id);

create index if not exists learning_piece_statuses_status_idx
  on public.learning_piece_statuses (status);

create index if not exists artifacts_cohort_status_idx
  on public.artifacts (cohort_id, status);

create index if not exists artifacts_owner_idx
  on public.artifacts (owner_type, owner_id);

create index if not exists artifacts_learning_piece_idx
  on public.artifacts (learning_piece_id);

create index if not exists submissions_artifact_version_idx
  on public.submissions (artifact_id, version desc);

create index if not exists submissions_submitted_by_idx
  on public.submissions (submitted_by);

create index if not exists feedback_artifact_status_idx
  on public.feedback (artifact_id, status);

create index if not exists feedback_author_idx
  on public.feedback (author_id);

create index if not exists mentoring_sessions_cohort_idx
  on public.mentoring_sessions (cohort_id);

create index if not exists mentoring_sessions_target_idx
  on public.mentoring_sessions (target_type, target_id);

create index if not exists mentoring_sessions_status_idx
  on public.mentoring_sessions (status);

create index if not exists risk_signals_cohort_idx
  on public.risk_signals (cohort_id);

create index if not exists risk_signals_target_idx
  on public.risk_signals (target_type, target_id);

create index if not exists risk_signals_status_idx
  on public.risk_signals (action_status, severity);

create index if not exists reminder_candidates_risk_signal_idx
  on public.reminder_candidates (risk_signal_id);

create index if not exists reminder_candidates_target_idx
  on public.reminder_candidates (target_type, target_id);

create index if not exists reminder_candidates_status_idx
  on public.reminder_candidates (send_status, recommended_at);

create index if not exists learning_outcomes_category_idx
  on public.learning_outcomes (category);

create index if not exists rubrics_artifact_status_idx
  on public.rubrics (artifact_type, status);

create index if not exists rubric_items_rubric_order_idx
  on public.rubric_items (rubric_id, order_index);

create index if not exists rubric_items_outcome_ids_idx
  on public.rubric_items using gin (outcome_ids);

create index if not exists evaluations_artifact_idx
  on public.evaluations (artifact_id, evaluated_at);

create index if not exists evaluations_rubric_idx
  on public.evaluations (rubric_id);

create index if not exists evaluation_item_scores_evaluation_idx
  on public.evaluation_item_scores (evaluation_id);

create index if not exists outcome_evidence_outcome_idx
  on public.outcome_evidence (outcome_id, recorded_at);

create index if not exists outcome_evidence_student_idx
  on public.outcome_evidence (student_id);

create index if not exists audit_logs_occurred_idx
  on public.audit_logs (occurred_at desc);

create index if not exists audit_logs_target_idx
  on public.audit_logs (target_type, target_id);

create index if not exists access_logs_occurred_idx
  on public.access_logs (occurred_at desc);

create index if not exists access_logs_actor_idx
  on public.access_logs (actor_id, occurred_at desc);

create index if not exists lms_content_mappings_cohort_status_idx
  on public.lms_content_mappings (cohort_id, status);

create index if not exists lms_content_mappings_learning_piece_idx
  on public.lms_content_mappings (learning_piece_id);

create index if not exists lms_content_mappings_lms_target_idx
  on public.lms_content_mappings (lms_content_id, lms_course_round_id);

create unique index if not exists lms_content_mappings_lms_target_unique
  on public.lms_content_mappings (cohort_id, lms_content_id, coalesce(lms_course_round_id, ''));

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

drop trigger if exists set_modules_updated_at on public.modules;
create trigger set_modules_updated_at
before update on public.modules
for each row execute function public.set_updated_at();

drop trigger if exists set_contents_updated_at on public.contents;
create trigger set_contents_updated_at
before update on public.contents
for each row execute function public.set_updated_at();

drop trigger if exists set_learning_pieces_updated_at on public.learning_pieces;
create trigger set_learning_pieces_updated_at
before update on public.learning_pieces
for each row execute function public.set_updated_at();

drop trigger if exists set_learning_piece_statuses_updated_at on public.learning_piece_statuses;
create trigger set_learning_piece_statuses_updated_at
before update on public.learning_piece_statuses
for each row execute function public.set_updated_at();

drop trigger if exists set_artifacts_updated_at on public.artifacts;
create trigger set_artifacts_updated_at
before update on public.artifacts
for each row execute function public.set_updated_at();

drop trigger if exists set_submissions_updated_at on public.submissions;
create trigger set_submissions_updated_at
before update on public.submissions
for each row execute function public.set_updated_at();

drop trigger if exists set_feedback_updated_at on public.feedback;
create trigger set_feedback_updated_at
before update on public.feedback
for each row execute function public.set_updated_at();

drop trigger if exists set_mentoring_sessions_updated_at on public.mentoring_sessions;
create trigger set_mentoring_sessions_updated_at
before update on public.mentoring_sessions
for each row execute function public.set_updated_at();

drop trigger if exists set_risk_signals_updated_at on public.risk_signals;
create trigger set_risk_signals_updated_at
before update on public.risk_signals
for each row execute function public.set_updated_at();

drop trigger if exists set_reminder_candidates_updated_at on public.reminder_candidates;
create trigger set_reminder_candidates_updated_at
before update on public.reminder_candidates
for each row execute function public.set_updated_at();

drop trigger if exists set_learning_outcomes_updated_at on public.learning_outcomes;
create trigger set_learning_outcomes_updated_at
before update on public.learning_outcomes
for each row execute function public.set_updated_at();

drop trigger if exists set_rubrics_updated_at on public.rubrics;
create trigger set_rubrics_updated_at
before update on public.rubrics
for each row execute function public.set_updated_at();

drop trigger if exists set_rubric_items_updated_at on public.rubric_items;
create trigger set_rubric_items_updated_at
before update on public.rubric_items
for each row execute function public.set_updated_at();

drop trigger if exists set_evaluations_updated_at on public.evaluations;
create trigger set_evaluations_updated_at
before update on public.evaluations
for each row execute function public.set_updated_at();

drop trigger if exists set_evaluation_item_scores_updated_at on public.evaluation_item_scores;
create trigger set_evaluation_item_scores_updated_at
before update on public.evaluation_item_scores
for each row execute function public.set_updated_at();

drop trigger if exists set_outcome_evidence_updated_at on public.outcome_evidence;
create trigger set_outcome_evidence_updated_at
before update on public.outcome_evidence
for each row execute function public.set_updated_at();

drop trigger if exists set_lms_content_mappings_updated_at on public.lms_content_mappings;
create trigger set_lms_content_mappings_updated_at
before update on public.lms_content_mappings
for each row execute function public.set_updated_at();

comment on table public.users is
  'Application domain users for PS Track. Keycloak or AlphaCampus identity is linked through external_subject.';

comment on column public.users.external_subject is
  'Verified Keycloak subject or AlphaCampus user identifier received through the auth boundary.';

comment on table public.role_assignments is
  'Role plus scope assignments used by SessionProvider and permission checks.';

comment on column public.role_assignments.scope_id is
  'Text by design because scope targets are polymorphic: system, program, cohort, track, team, or student.';

comment on table public.learning_piece_statuses is
  'Per-student PS Track learning piece state. LMS readonly completion can be manually applied into this table.';

comment on table public.modules is
  'Reusable PS Track journey module definitions for a cohort template or active cohort.';

comment on table public.contents is
  'PS Track content objects grouped under modules. LMS mappings may point at these content records.';

comment on table public.learning_pieces is
  'Atomic learning tasks shown on a student journey and connected to status, LMS mappings, artifacts, and outcomes.';

comment on table public.artifacts is
  'Student or team outputs connected to learning pieces and learning outcomes.';

comment on table public.submissions is
  'Versioned metadata for artifact submissions. File storage is handled outside this table.';

comment on table public.feedback is
  'Artifact or mentoring feedback records shown in review workflows.';

comment on table public.mentoring_sessions is
  'Mentoring schedule and record rows owned by PS Track for MVP operations.';

comment on table public.risk_signals is
  'Operational risk signals used by operators to detect learning delays, missing artifacts, and mentoring issues.';

comment on table public.reminder_candidates is
  'Recommended reminder targets linked to risk signals. Actual external sending is handled outside the MVP.';

comment on table public.learning_outcomes is
  'Learning outcome definitions connected to rubric items and evidence.';

comment on table public.rubrics is
  'Rubric definitions for evaluating artifact types.';

comment on table public.rubric_items is
  'Scored rubric criteria with links to learning outcomes.';

comment on table public.evaluations is
  'Submitted artifact evaluations. Evaluator id remains text until full auth cutover.';

comment on table public.evaluation_item_scores is
  'Per-rubric-item scores belonging to an artifact evaluation.';

comment on table public.outcome_evidence is
  'Evidence rows used to show how learning outcomes are demonstrated.';

comment on table public.audit_logs is
  'Administrative audit events for important configuration, permission, and domain mutations.';

comment on table public.access_logs is
  'Authentication and session access events. Retention policy should be approved before production launch.';

comment on table public.lms_content_mappings is
  'Operator-managed mapping between PS Track learning pieces and LMS readonly content/course round records.';

comment on column public.lms_content_mappings.activation_rule is
  'Rule used to activate or complete the mapped learning piece from LMS readonly learning records.';
