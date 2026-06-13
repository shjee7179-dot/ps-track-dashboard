create table if not exists lms_content_catalog_source (
  lms_content_id text primary key,
  lms_course_round_id text,
  content_group text not null,
  content_type text not null,
  content_title text not null,
  course_round_title text,
  provider_org text,
  open_status_code text,
  open_status_label text,
  apply_starts_at timestamptz,
  apply_ends_at timestamptz,
  learning_starts_at timestamptz,
  learning_ends_at timestamptz,
  updated_at timestamptz
);

create table if not exists lms_learning_record_source (
  lms_record_id text primary key,
  lms_user_id text not null,
  keycloak_subject text,
  user_name text,
  user_email text,
  user_phone_masked text,
  lms_content_id text not null,
  lms_course_round_id text,
  content_group text not null,
  content_type text not null,
  content_title text not null,
  course_round_title text,
  participation_status_code text,
  participation_status_label text,
  completion_status_code text,
  completion_status_label text,
  completion_bucket text,
  progress_rate numeric,
  score numeric,
  learning_time_minutes integer,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz
);

truncate table lms_learning_record_source;
truncate table lms_content_catalog_source;

insert into lms_content_catalog_source (
  lms_content_id,
  lms_course_round_id,
  content_group,
  content_type,
  content_title,
  course_round_title,
  provider_org,
  open_status_code,
  open_status_label,
  learning_starts_at,
  learning_ends_at,
  updated_at
) values
  (
    'lms-content-pool-synthetic-001',
    'lms-round-synthetic-ps-track-2026-01',
    'regular',
    'online',
    '미래 의사과학자 연구 질문 만들기',
    '2026 미래 의사과학자 챌린지 트랙 1차',
    'KIRD AlphaCampus',
    'OPEN',
    '운영중',
    '2026-07-01T00:00:00+09:00',
    '2026-10-31T23:59:59+09:00',
    '2026-07-01T00:00:00+09:00'
  ),
  (
    'lms-channel-content-synthetic-001',
    null,
    'subscription',
    'knowledge',
    '의사과학자 진로 탐색 지식 콘텐츠',
    null,
    'KIRD AlphaCampus',
    'OPEN',
    '노출중',
    null,
    null,
    '2026-07-01T00:00:00+09:00'
  ),
  (
    'lms-ebook-content-synthetic-001',
    null,
    'subscription',
    'ebook',
    '바이오메디컬 연구 입문 전자책',
    null,
    'KIRD AlphaCampus',
    'N',
    '사용',
    null,
    null,
    '2026-07-01T00:00:00+09:00'
  ),
  (
    'lms-learning-lab-synthetic-001',
    null,
    'community',
    'learning_group',
    '미래 의사과학자 연구 관심사 학습모임',
    null,
    'KIRD AlphaCampus',
    '2',
    '승인',
    '2026-07-01T00:00:00+09:00',
    '2026-10-31T23:59:59+09:00',
    '2026-07-01T00:00:00+09:00'
  );

insert into lms_learning_record_source (
  lms_record_id,
  lms_user_id,
  keycloak_subject,
  user_name,
  user_email,
  user_phone_masked,
  lms_content_id,
  lms_course_round_id,
  content_group,
  content_type,
  content_title,
  course_round_title,
  participation_status_code,
  participation_status_label,
  completion_status_code,
  completion_status_label,
  completion_bucket,
  progress_rate,
  score,
  learning_time_minutes,
  started_at,
  completed_at,
  updated_at
) values
  (
    'lms-enrollment-synthetic-001',
    'lms-user-synthetic-001',
    'keycloak-subject-synthetic-001',
    'Synthetic Student',
    'synthetic.student@example.test',
    '010-****-0001',
    'lms-content-pool-synthetic-001',
    'lms-round-synthetic-ps-track-2026-01',
    'regular',
    'online',
    '미래 의사과학자 연구 질문 만들기',
    '2026 미래 의사과학자 챌린지 트랙 1차',
    'APPROVED',
    '승인',
    'COMPLETED',
    '수료',
    'completed',
    100,
    95,
    120,
    '2026-07-01T00:00:00+09:00',
    '2026-07-15T09:00:00+09:00',
    '2026-07-15T09:00:00+09:00'
  ),
  (
    'lms-channel-learning-synthetic-001',
    'lms-user-synthetic-001',
    'keycloak-subject-synthetic-001',
    'Synthetic Student',
    'synthetic.student@example.test',
    '010-****-0001',
    'lms-channel-content-synthetic-001',
    null,
    'subscription',
    'knowledge',
    '의사과학자 진로 탐색 지식 콘텐츠',
    null,
    null,
    null,
    'Y',
    '완료',
    'completed',
    100,
    null,
    30,
    null,
    '2026-07-20T09:00:00+09:00',
    '2026-07-20T09:00:00+09:00'
  ),
  (
    'lms-ebook-learning-synthetic-001',
    'lms-user-synthetic-001',
    'keycloak-subject-synthetic-001',
    'Synthetic Student',
    'synthetic.student@example.test',
    '010-****-0001',
    'lms-ebook-content-synthetic-001',
    null,
    'subscription',
    'ebook',
    '바이오메디컬 연구 입문 전자책',
    null,
    null,
    null,
    'P',
    '학습중',
    'not_completed',
    45,
    null,
    40,
    '2026-08-01T09:00:00+09:00',
    null,
    '2026-08-01T09:00:00+09:00'
  ),
  (
    'lms-learning-lab-member-synthetic-001',
    'lms-user-synthetic-001',
    'keycloak-subject-synthetic-001',
    'Synthetic Student',
    'synthetic.student@example.test',
    '010-****-0001',
    'lms-learning-lab-synthetic-001',
    null,
    'community',
    'learning_group',
    '미래 의사과학자 연구 관심사 학습모임',
    null,
    'JOINED',
    '참여',
    'N',
    '미완료',
    'not_completed',
    null,
    null,
    60,
    '2026-08-10T09:00:00+09:00',
    null,
    '2026-08-10T09:00:00+09:00'
  );

create or replace view lms_content_catalog_view as
select
  lms_content_id,
  lms_course_round_id,
  content_group,
  content_type,
  content_title,
  course_round_title,
  provider_org,
  open_status_code,
  open_status_label,
  apply_starts_at,
  apply_ends_at,
  learning_starts_at,
  learning_ends_at,
  updated_at
from lms_content_catalog_source;

create or replace view lms_learning_record_view as
select
  lms_record_id,
  lms_user_id,
  keycloak_subject,
  user_name,
  user_email,
  user_phone_masked,
  lms_content_id,
  lms_course_round_id,
  content_group,
  content_type,
  content_title,
  course_round_title,
  participation_status_code,
  participation_status_label,
  completion_status_code,
  completion_status_label,
  completion_bucket,
  progress_rate,
  score,
  learning_time_minutes,
  started_at,
  completed_at,
  updated_at
from lms_learning_record_source;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'lms_readonly') then
    create role lms_readonly login password 'lms_readonly_password';
  end if;
end
$$;

revoke all on schema public from public;
grant usage on schema public to lms_readonly;

revoke all on all tables in schema public from lms_readonly;
grant select on lms_content_catalog_view to lms_readonly;
grant select on lms_learning_record_view to lms_readonly;
