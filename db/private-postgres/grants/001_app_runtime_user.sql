-- Private PostgreSQL app runtime grants
-- Usage:
--   psql "$DATABASE_URL" -v app_role=ps_track_app_runtime \
--     -f db/private-postgres/grants/001_app_runtime_user.sql
--
-- This file intentionally does not create users or store passwords.
-- In production, the DBA or migration owner should create the runtime role
-- through the approved secret/account process, then apply these grants.

\if :{?app_role}
\else
  \echo 'app_role variable is required. Example: -v app_role=ps_track_app_runtime'
  \quit 1
\endif

grant usage on schema public to :"app_role";

grant select on table
  public.users,
  public.role_assignments,
  public.programs,
  public.cohorts,
  public.teams,
  public.team_members,
  public.modules,
  public.contents,
  public.learning_pieces,
  public.learning_piece_statuses,
  public.artifacts,
  public.submissions,
  public.feedback,
  public.mentoring_sessions,
  public.learning_outcomes,
  public.rubrics,
  public.rubric_items,
  public.evaluations,
  public.evaluation_item_scores,
  public.outcome_evidence,
  public.audit_logs,
  public.access_logs,
  public.lms_content_mappings
to :"app_role";

grant insert, update on table
  public.learning_piece_statuses,
  public.artifacts,
  public.submissions,
  public.feedback,
  public.mentoring_sessions,
  public.evaluations,
  public.evaluation_item_scores,
  public.outcome_evidence,
  public.audit_logs,
  public.access_logs,
  public.lms_content_mappings
to :"app_role";

grant usage, select on all sequences in schema public to :"app_role";

alter default privileges in schema public
  grant select on tables to :"app_role";

alter default privileges in schema public
  grant usage, select on sequences to :"app_role";
