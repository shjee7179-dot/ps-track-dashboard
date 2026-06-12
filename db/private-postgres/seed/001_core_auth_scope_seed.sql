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
    'keycloak-subject-synthetic-001',
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

insert into public.modules (
  id,
  title,
  description,
  order_index,
  status
)
values
  (
    'module-001',
    '오리엔테이션과 연구 여정 설계',
    '프로그램 구조를 이해하고 개인 연구 관심사를 정리한다.',
    1,
    'open'
  ),
  (
    'module-002',
    '의사과학자 연구 기초',
    '문제 정의, 연구 질문, 문헌 탐색의 기초를 학습한다.',
    2,
    'open'
  ),
  (
    'module-003',
    '중간 산출물 작성',
    '연구계획서 초안을 작성하고 멘토 피드백을 반영한다.',
    3,
    'draft'
  )
on conflict (id) do update
  set title = excluded.title,
      description = excluded.description,
      order_index = excluded.order_index,
      status = excluded.status,
      updated_at = now();

insert into public.contents (
  id,
  module_id,
  title,
  content_type
)
values
  ('content-001', 'module-001', '챌린지 트랙 오리엔테이션', 'workshop'),
  ('content-002', 'module-001', '나의 연구 관심사 진단', 'assignment'),
  ('content-003', 'module-002', '연구 질문을 만드는 방법', 'video'),
  ('content-004', 'module-002', '문헌 탐색 실습', 'practice'),
  ('content-005', 'module-003', '연구계획서 초안 가이드', 'assignment')
on conflict (id) do update
  set module_id = excluded.module_id,
      title = excluded.title,
      content_type = excluded.content_type,
      updated_at = now();

insert into public.learning_pieces (
  id,
  module_id,
  content_id,
  title,
  piece_type,
  completion_rule,
  opens_at,
  due_at,
  requires_submission,
  requires_approval,
  requires_evaluation,
  outcome_tags
)
values
  (
    'lp-001',
    'module-001',
    'content-001',
    '오리엔테이션 참석 확인',
    'workshop',
    '운영자가 참석 여부를 확인하면 완료',
    date '2026-07-01',
    date '2026-07-03',
    false,
    true,
    false,
    array['프로그램 이해', '학습 계획']
  ),
  (
    'lp-002',
    'module-001',
    'content-002',
    '연구 관심사 자기소개 제출',
    'assignment',
    '학생이 자기소개와 관심 주제를 제출하면 완료',
    date '2026-07-01',
    date '2026-07-08',
    true,
    false,
    false,
    array['진로탐색', '문제 인식']
  ),
  (
    'lp-003',
    'module-002',
    'content-003',
    '연구 질문 강의 시청',
    'video',
    '영상 시청 완료 체크',
    date '2026-07-09',
    date '2026-07-15',
    false,
    false,
    false,
    array['연구 이해', '문제 정의']
  ),
  (
    'lp-004',
    'module-002',
    'content-004',
    '핵심 논문 3편 탐색 기록',
    'practice',
    '논문 탐색 기록을 제출하면 완료',
    date '2026-07-16',
    date '2026-07-24',
    true,
    true,
    false,
    array['문헌 탐색', '근거 기반 사고']
  ),
  (
    'lp-005',
    'module-003',
    'content-005',
    '연구계획서 초안 제출',
    'mid_artifact',
    '초안 제출 후 멘토 피드백을 받으면 완료',
    date '2026-08-01',
    date '2026-08-12',
    true,
    true,
    true,
    array['연구 설계', '산출물 작성']
  )
on conflict (id) do update
  set module_id = excluded.module_id,
      content_id = excluded.content_id,
      title = excluded.title,
      piece_type = excluded.piece_type,
      completion_rule = excluded.completion_rule,
      opens_at = excluded.opens_at,
      due_at = excluded.due_at,
      requires_submission = excluded.requires_submission,
      requires_approval = excluded.requires_approval,
      requires_evaluation = excluded.requires_evaluation,
      outcome_tags = excluded.outcome_tags,
      updated_at = now();

insert into public.learning_piece_statuses (
  student_id,
  learning_piece_id,
  status,
  completed_at,
  note
)
select users.id, seed.learning_piece_id, seed.status, seed.completed_at, seed.note
from public.users
cross join (
  values
    ('lp-001', 'completed', date '2026-07-02', '오리엔테이션 참석 확인 완료'),
    ('lp-002', 'pending_review', null::date, '관심 주제 제출 완료, 운영 확인 대기'),
    ('lp-003', 'in_progress', null::date, '영상 60% 시청'),
    ('lp-004', 'not_started', null::date, null),
    ('lp-005', 'locked', null::date, null)
) as seed(learning_piece_id, status, completed_at, note)
where users.email = 'student@example.kr'
on conflict (student_id, learning_piece_id) do update
  set status = excluded.status,
      completed_at = excluded.completed_at,
      note = excluded.note,
      updated_at = now();

insert into public.artifacts (
  id,
  cohort_id,
  artifact_type,
  title,
  owner_type,
  owner_id,
  learning_piece_id,
  status,
  due_at,
  final_confirmed,
  outcome_tags
)
select
  seed.id,
  cohorts.id,
  seed.artifact_type,
  seed.title,
  seed.owner_type,
  seed.owner_id,
  seed.learning_piece_id,
  seed.status,
  seed.due_at,
  seed.final_confirmed,
  seed.outcome_tags
from public.cohorts
cross join (
  values
    (
      'artifact-001',
      'profile',
      '연구 관심사 자기소개',
      'student',
      'student-001',
      'lp-002',
      'submitted',
      date '2026-07-08',
      false,
      array['진로탐색', '문제 인식']
    ),
    (
      'artifact-002',
      'literature_log',
      '핵심 논문 3편 탐색 기록',
      'student',
      'student-001',
      'lp-004',
      'drafting',
      date '2026-07-24',
      false,
      array['문헌 탐색', '데이터 해석']
    ),
    (
      'artifact-003',
      'research_plan',
      '팀 연구계획서 초안',
      'team',
      'team-001',
      'lp-005',
      'in_review',
      date '2026-08-12',
      false,
      array['연구 설계', '과학 커뮤니케이션']
    )
) as seed(
  id,
  artifact_type,
  title,
  owner_type,
  owner_id,
  learning_piece_id,
  status,
  due_at,
  final_confirmed,
  outcome_tags
)
where cohorts.code = 'cohort-2026-1'
on conflict (id) do update
  set cohort_id = excluded.cohort_id,
      artifact_type = excluded.artifact_type,
      title = excluded.title,
      owner_type = excluded.owner_type,
      owner_id = excluded.owner_id,
      learning_piece_id = excluded.learning_piece_id,
      status = excluded.status,
      due_at = excluded.due_at,
      final_confirmed = excluded.final_confirmed,
      outcome_tags = excluded.outcome_tags,
      updated_at = now();

insert into public.submissions (
  id,
  artifact_id,
  submitted_by,
  version,
  submitted_at,
  file_name,
  external_url,
  note
)
values
  (
    '00000000-0000-4000-8000-000000000101',
    'artifact-001',
    'student-001',
    1,
    timestamptz '2026-07-07 21:10:00+09',
    null,
    'https://example.com/submissions/research-interest',
    '관심 연구 분야와 자기소개 제출'
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    'artifact-003',
    'student-001',
    1,
    timestamptz '2026-08-09 20:40:00+09',
    'research-plan-v1.pdf',
    null,
    '팀 연구계획서 1차 초안'
  )
on conflict (artifact_id, version) do update
  set submitted_by = excluded.submitted_by,
      submitted_at = excluded.submitted_at,
      file_name = excluded.file_name,
      external_url = excluded.external_url,
      note = excluded.note,
      updated_at = now();

insert into public.feedback (
  id,
  artifact_id,
  mentoring_session_id,
  author_id,
  target_user_id,
  target_team_id,
  body,
  status,
  created_at
)
values
  (
    '00000000-0000-4000-8000-000000000201',
    'artifact-001',
    'mentoring-001',
    'mentor-001',
    'student-001',
    null,
    '관심 주제는 좋지만 임상 문제와 연구 질문을 더 분리해서 써보면 좋겠습니다.',
    'open',
    timestamptz '2026-07-18 20:05:00+09'
  ),
  (
    '00000000-0000-4000-8000-000000000202',
    'artifact-003',
    'mentoring-002',
    'mentor-001',
    null,
    'team-001',
    '팀 연구계획서는 질문 범위를 좁히고 측정 가능한 변수 정의를 보강해야 합니다.',
    'open',
    timestamptz '2026-08-10 21:00:00+09'
  )
on conflict (id) do update
  set artifact_id = excluded.artifact_id,
      mentoring_session_id = excluded.mentoring_session_id,
      author_id = excluded.author_id,
      target_user_id = excluded.target_user_id,
      target_team_id = excluded.target_team_id,
      body = excluded.body,
      status = excluded.status,
      updated_at = now();

insert into public.learning_outcomes (
  id,
  code,
  title,
  description,
  category
)
values
  (
    'outcome-001',
    'LO-01',
    '문제 인식과 연구 질문',
    '임상 또는 바이오메디컬 맥락의 문제를 연구 가능한 질문으로 전환한다.',
    'research_foundation'
  ),
  (
    'outcome-002',
    'LO-02',
    '문헌 탐색과 근거 해석',
    '핵심 문헌을 탐색하고 연구 질문과 연결되는 근거를 정리한다.',
    'research_foundation'
  ),
  (
    'outcome-003',
    'LO-03',
    '연구 설계',
    '대상, 변수, 방법을 포함한 실행 가능한 연구계획을 구성한다.',
    'research_design'
  ),
  (
    'outcome-004',
    'LO-04',
    '과학 커뮤니케이션',
    '연구 아이디어와 산출물을 명확한 글과 발표 구조로 전달한다.',
    'communication'
  ),
  (
    'outcome-005',
    'LO-05',
    '의사과학자 진로 성찰',
    '개인의 관심, 역량, 진로 동기를 의사과학자 성장 경로와 연결한다.',
    'career'
  )
on conflict (id) do update
  set code = excluded.code,
      title = excluded.title,
      description = excluded.description,
      category = excluded.category,
      updated_at = now();

insert into public.rubrics (
  id,
  artifact_type,
  title,
  max_score,
  status
)
values
  ('rubric-001', 'profile', '연구 관심사 자기소개 루브릭', 15, 'active'),
  ('rubric-002', 'research_plan', '연구계획서 초안 루브릭', 20, 'active')
on conflict (id) do update
  set artifact_type = excluded.artifact_type,
      title = excluded.title,
      max_score = excluded.max_score,
      status = excluded.status,
      updated_at = now();

insert into public.rubric_items (
  id,
  rubric_id,
  title,
  description,
  max_score,
  outcome_ids,
  order_index
)
values
  (
    'rubric-item-001',
    'rubric-001',
    '문제 맥락',
    '관심 주제의 배경과 문제 상황을 구체적으로 설명한다.',
    5,
    array['outcome-001'],
    1
  ),
  (
    'rubric-item-002',
    'rubric-001',
    '진로 성찰',
    '개인의 관심과 의사과학자 진로 동기를 연결한다.',
    5,
    array['outcome-005'],
    2
  ),
  (
    'rubric-item-003',
    'rubric-001',
    '표현 명료성',
    '핵심 메시지를 읽기 쉬운 구조로 전달한다.',
    5,
    array['outcome-004'],
    3
  ),
  (
    'rubric-item-004',
    'rubric-002',
    '연구 질문의 초점',
    '연구 질문이 측정 가능하고 범위가 적절하다.',
    5,
    array['outcome-001', 'outcome-003'],
    1
  ),
  (
    'rubric-item-005',
    'rubric-002',
    '근거와 문헌 연결',
    '선행 근거가 연구 필요성과 자연스럽게 연결된다.',
    5,
    array['outcome-002'],
    2
  ),
  (
    'rubric-item-006',
    'rubric-002',
    '방법 설계',
    '대상, 변수, 분석 방향이 실행 가능한 수준으로 제시된다.',
    5,
    array['outcome-003'],
    3
  ),
  (
    'rubric-item-007',
    'rubric-002',
    '계획서 구성',
    '연구계획서의 구조와 표현이 명확하다.',
    5,
    array['outcome-004'],
    4
  )
on conflict (id) do update
  set rubric_id = excluded.rubric_id,
      title = excluded.title,
      description = excluded.description,
      max_score = excluded.max_score,
      outcome_ids = excluded.outcome_ids,
      order_index = excluded.order_index,
      updated_at = now();

insert into public.evaluations (
  id,
  artifact_id,
  rubric_id,
  evaluator_id,
  evaluated_at,
  total_score,
  max_score,
  overall_comment,
  status
)
values
  (
    'evaluation-001',
    'artifact-001',
    'rubric-001',
    'mentor-001',
    timestamptz '2026-07-19 10:30:00+09',
    12,
    15,
    '관심 주제와 진로 동기는 잘 드러나며, 연구 질문 형태로 더 좁히면 좋겠습니다.',
    'submitted'
  ),
  (
    'evaluation-002',
    'artifact-003',
    'rubric-002',
    'pi-001',
    timestamptz '2026-08-13 14:00:00+09',
    15,
    20,
    '연구 질문의 방향은 좋고, 변수 정의와 방법 설계 보완이 필요합니다.',
    'submitted'
  )
on conflict (id) do update
  set artifact_id = excluded.artifact_id,
      rubric_id = excluded.rubric_id,
      evaluator_id = excluded.evaluator_id,
      evaluated_at = excluded.evaluated_at,
      total_score = excluded.total_score,
      max_score = excluded.max_score,
      overall_comment = excluded.overall_comment,
      status = excluded.status,
      updated_at = now();

insert into public.evaluation_item_scores (
  id,
  evaluation_id,
  rubric_item_id,
  score,
  comment
)
values
  (
    'score-001',
    'evaluation-001',
    'rubric-item-001',
    4,
    '문제 상황은 구체적이나 연구 질문으로 더 정제해야 합니다.'
  ),
  (
    'score-002',
    'evaluation-001',
    'rubric-item-002',
    5,
    '진로 동기와 개인 경험 연결이 좋습니다.'
  ),
  (
    'score-003',
    'evaluation-001',
    'rubric-item-003',
    3,
    '문단 구조를 조금 더 명확히 다듬으면 좋겠습니다.'
  ),
  (
    'score-004',
    'evaluation-002',
    'rubric-item-004',
    4,
    '질문 방향은 적절하며 대상 범위를 좁힐 필요가 있습니다.'
  ),
  (
    'score-005',
    'evaluation-002',
    'rubric-item-005',
    3,
    '핵심 문헌과 연구 필요성의 연결을 보강해야 합니다.'
  ),
  (
    'score-006',
    'evaluation-002',
    'rubric-item-006',
    4,
    '변수 정의가 일부 필요하지만 실행 방향은 보입니다.'
  ),
  (
    'score-007',
    'evaluation-002',
    'rubric-item-007',
    4,
    '계획서 흐름은 읽기 좋습니다.'
  )
on conflict (evaluation_id, rubric_item_id) do update
  set score = excluded.score,
      comment = excluded.comment,
      updated_at = now();

insert into public.outcome_evidence (
  id,
  outcome_id,
  student_id,
  source_type,
  source_id,
  evidence_label,
  recorded_at
)
values
  (
    'evidence-001',
    'outcome-005',
    'student-001',
    'artifact',
    'artifact-001',
    '연구 관심사 자기소개 제출',
    timestamptz '2026-07-07 21:10:00+09'
  ),
  (
    'evidence-002',
    'outcome-001',
    'student-001',
    'evaluation',
    'evaluation-001',
    '문제 맥락 루브릭 점수 4/5',
    timestamptz '2026-07-19 10:30:00+09'
  ),
  (
    'evidence-003',
    'outcome-004',
    'student-001',
    'feedback',
    '00000000-0000-4000-8000-000000000201',
    '관심 주제 설명에 대한 멘토 피드백',
    timestamptz '2026-07-18 20:05:00+09'
  ),
  (
    'evidence-004',
    'outcome-003',
    'student-001',
    'evaluation',
    'evaluation-002',
    '연구계획서 방법 설계 점수 4/5',
    timestamptz '2026-08-13 14:00:00+09'
  )
on conflict (id) do update
  set outcome_id = excluded.outcome_id,
      student_id = excluded.student_id,
      source_type = excluded.source_type,
      source_id = excluded.source_id,
      evidence_label = excluded.evidence_label,
      recorded_at = excluded.recorded_at,
      updated_at = now();

insert into public.lms_content_mappings (
  cohort_id,
  module_id,
  content_id,
  learning_piece_id,
  lms_content_id,
  lms_course_round_id,
  content_group,
  content_type,
  required,
  activation_rule,
  status,
  created_by
)
select
  cohorts.id,
  seed.module_id,
  seed.content_id,
  seed.learning_piece_id,
  seed.lms_content_id,
  seed.lms_course_round_id,
  seed.content_group,
  seed.content_type,
  true,
  'completion_completed',
  'active',
  users.id
from public.cohorts
cross join public.users
cross join (
  values
    (
      'module-001',
      'content-001',
      'lp-001',
      'lms-content-pool-synthetic-001',
      'lms-round-synthetic-ps-track-2026-01',
      'regular',
      'online'
    ),
    (
      'module-002',
      'content-003',
      'lp-003',
      'lms-channel-content-synthetic-001',
      null,
      'subscription',
      'knowledge'
    )
) as seed(
  module_id,
  content_id,
  learning_piece_id,
  lms_content_id,
  lms_course_round_id,
  content_group,
  content_type
)
where cohorts.code = 'cohort-2026-1'
  and users.email = 'operator@example.kr'
on conflict (cohort_id, learning_piece_id) do update
  set module_id = excluded.module_id,
      content_id = excluded.content_id,
      lms_content_id = excluded.lms_content_id,
      lms_course_round_id = excluded.lms_course_round_id,
      content_group = excluded.content_group,
      content_type = excluded.content_type,
      required = excluded.required,
      activation_rule = excluded.activation_rule,
      status = excluded.status,
      updated_at = now();

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
