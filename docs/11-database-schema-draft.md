# Database Schema Draft

## Naming

- 테이블명은 snake_case 복수형을 사용한다.
- 기본 PK는 `id uuid primary key`를 사용한다.
- 생성/수정 시각은 `created_at`, `updated_at`을 사용한다.
- 상태값은 초기에는 text enum으로 시작하고 안정화 후 DB enum으로 고정할 수 있다.

## Core Auth/Scope SQL Draft

- 1차 SQL 초안은 `db/schema/001_core_auth_scope.sql`에 둔다.
- 이 파일은 Auth/session provider와 users/role assignments repository를 흔들리지 않게 만들기 위한 기준안이다.
- 아직 Supabase 프로젝트에 적용한 실행 migration은 아니며, 실제 적용 전 seed, RLS, migration ordering을 별도 PR에서 검증한다.
- 최소 검증 seed 초안은 `db/seed/001_core_auth_scope_seed.sql`에 둔다.
- 첫 RLS policy 초안은 `db/policies/001_core_auth_scope_rls.sql`에 둔다.
- `users.id`는 앱 도메인 id로 유지하고, Supabase Auth 연결은 `users.auth_user_id`로 분리한다.
- `users.external_subject`는 LMS/Keycloak Future Integration Track을 위한 연결값으로 남긴다.
- `role_assignments.scope_id`는 uuid가 아니라 text로 둔다. `system`, `program`, `cohort`, `track`, `team`, `student` scope가 서로 다른 대상 테이블 또는 상수값을 가질 수 있기 때문이다.

## Seed / RLS Draft

- seed는 mock MVP의 2026년 1기 사용자, 프로그램, 기수, 팀, 팀원, 역할 배정을 실제 UUID 기반 row로 변환한다.
- seed 사용자는 `auth_user_id`를 비워두고, 실제 Supabase Auth 계정 생성 후 이메일 또는 운영 절차로 연결한다.
- RLS 초안은 read policy부터 둔다. write policy는 server action, permission check, audit log 흐름이 구체화된 뒤 추가한다.
- `service_role` 기반 server-side mutation은 RLS보다 application guard를 우선 검증한다.

## Core Tables

### users

Supabase Auth 사용 시 `auth.users`와 별도의 프로필 테이블로 둔다.

| column | type | note |
| --- | --- | --- |
| id | uuid | 앱 도메인 user id |
| auth_user_id | uuid | Supabase `auth.users.id`, nullable |
| external_subject | text | 향후 LMS/Keycloak subject |
| name | text | 사용자 이름 |
| email | text | 이메일 |
| affiliation | text | 소속 |
| default_role | text | 기본 역할 |
| status | text | active/inactive |

### role_assignments

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| user_id | uuid | users.id |
| role | text | student/operator/pi/mentor/admin |
| scope_type | text | system/program/cohort/track/team/student |
| scope_id | text | scope 대상 id 또는 system 상수 |
| starts_at | timestamptz | 시작 |
| ends_at | timestamptz | 종료 |
| status | text | active/inactive |

### programs

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| code | text | 프로그램 코드 |
| name | text | 프로그램명 |
| description | text | 설명 |
| status | text | 상태 |

### cohorts

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| program_id | uuid | programs.id |
| code | text | 기수 코드 |
| name | text | 2026년 1기 등 |
| year | int | 운영 연도 |
| agreement_date | date | 협약일 |
| starts_at | date | 시작일 |
| ends_at | date | 종료일 |
| status | text | draft/active/closed |

### teams

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| cohort_id | uuid | cohorts.id |
| name | text | 팀명 |
| topic | text | 프로젝트 주제 |
| mentor_id | uuid | 담당 멘토 users.id nullable |
| status | text | 상태 |

### team_members

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| team_id | uuid | teams.id |
| user_id | uuid | users.id |
| role | text | member/leader |
| status | text | active/inactive |

## Learning Object Tables

### modules

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| cohort_id | uuid | cohorts.id |
| title | text | 모듈명 |
| description | text | 설명 |
| order_index | int | 순서 |
| status | text | draft/open/closed |

### contents

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| module_id | uuid | modules.id |
| title | text | 콘텐츠명 |
| content_type | text | video/reading/workshop/assignment/practice/link/offline/mentoring_guide |
| url | text | 외부 링크 |
| body | text | 설명 |
| file_path | text | 파일 경로 |
| status | text | 상태 |

### learning_pieces

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| cohort_id | uuid | cohorts.id |
| module_id | uuid | modules.id |
| content_id | uuid | contents.id nullable |
| title | text | 학습피스명 |
| piece_type | text | reading/video/assignment/mentoring/practice/mid_artifact/final_artifact/survey |
| completion_rule | text | 완료 기준 |
| requires_submission | boolean | 제출 필요 |
| requires_approval | boolean | 승인 필요 |
| requires_evaluation | boolean | 평가 필요 |
| opens_at | timestamptz | 공개일 |
| due_at | timestamptz | 마감일 |
| status | text | 상태 |

### learning_piece_statuses

학생별 학습피스 상태를 저장한다.

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| learning_piece_id | uuid | learning_pieces.id |
| student_id | uuid | users.id |
| status | text | 미공개/진행 전/진행 중/완료/지연 등 |
| completed_at | timestamptz | 완료 시각 |
| updated_by | uuid | users.id |

## Artifact / Evaluation Tables

### artifacts

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| cohort_id | uuid | cohorts.id |
| artifact_type | text | plan/mid_report/final_report/presentation/etc |
| title | text | 산출물명 |
| owner_type | text | student/team |
| owner_id | uuid | user or team id |
| learning_piece_id | uuid | nullable |
| status | text | 작성 전/제출됨/리뷰 중/최종 확정 등 |
| final_confirmed | boolean | 최종 확정 |

### submissions

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| artifact_id | uuid | artifacts.id |
| submitted_by | uuid | users.id |
| version | int | 제출 버전 |
| file_path | text | 저장 경로 |
| external_url | text | 외부 링크 |
| submitted_at | timestamptz | 제출 시각 |

### feedback

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| artifact_id | uuid | artifacts.id nullable |
| mentoring_session_id | uuid | mentoring_sessions.id nullable |
| author_id | uuid | users.id |
| target_user_id | uuid | users.id nullable |
| target_team_id | uuid | teams.id nullable |
| body | text | 피드백 |
| status | text | open/resolved |

### rubrics

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| name | text | 루브릭명 |
| artifact_type | text | 적용 산출물 유형 |
| is_template | boolean | 템플릿 여부 |

### rubric_items

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| rubric_id | uuid | rubrics.id |
| title | text | 항목명 |
| description | text | 설명 |
| min_score | numeric | 최소점 |
| max_score | numeric | 최대점 |
| weight | numeric | 가중치 |

### evaluations

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| artifact_id | uuid | artifacts.id |
| rubric_id | uuid | rubrics.id |
| evaluator_id | uuid | users.id |
| evaluator_role | text | mentor/pi/operator |
| total_score | numeric | 총점 |
| comment | text | 종합 코멘트 |
| status | text | draft/submitted |

### evaluation_scores

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| evaluation_id | uuid | evaluations.id |
| rubric_item_id | uuid | rubric_items.id |
| score | numeric | 점수 |
| comment | text | 항목 코멘트 |

## Mentoring / Operations Tables

### mentoring_sessions

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| cohort_id | uuid | cohorts.id |
| target_type | text | student/team |
| target_id | uuid | 대상 id |
| mentor_id | uuid | users.id |
| scheduled_at | timestamptz | 일정 |
| status | text | 예정/완료/불참/취소 |
| external_meeting_url | text | 외부 회의 링크 |
| notes | text | 기록 |
| linked_artifact_id | uuid | artifacts.id nullable |

### risk_signals

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| cohort_id | uuid | cohorts.id |
| target_type | text | student/team |
| target_id | uuid | 대상 id |
| risk_type | text | learning_piece_delay/artifact_missing/mentoring_issue |
| severity | text | low/medium/high |
| related_object_type | text | 관련 객체 |
| related_object_id | uuid | 관련 id |
| action_status | text | open/in_progress/resolved |
| action_note | text | 조치 메모 |

### reminder_candidates

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| risk_signal_id | uuid | risk_signals.id |
| target_type | text | student/team |
| target_id | uuid | 대상 id |
| reason | text | 추천 사유 |
| channel | text | email/sms/kakao/manual |
| send_status | text | pending/sent/skipped |
| sent_by | uuid | users.id nullable |
| sent_at | timestamptz | 발송 시각 |

### notices

| column | type | note |
| --- | --- | --- |
| id | uuid | PK |
| cohort_id | uuid | cohorts.id |
| title | text | 제목 |
| body | text | 내용 |
| target_scope_type | text | 대상 scope |
| target_scope_id | uuid | 대상 id |
| published_at | timestamptz | 게시일 |
| created_by | uuid | users.id |

## Logs / Settings Tables

### activity_logs

학습 활동과 운영 판단에 필요한 이벤트를 저장한다.

### audit_logs

관리자 설정, 권한, 중요 데이터 변경 이벤트를 저장한다.

### access_logs

로그인, 로그아웃, 세션 갱신 등 접속 이벤트를 저장한다.

### system_settings

전체 시스템 설정을 key-value 형태로 저장한다.

### pwa_settings

앱명, 아이콘, theme color, manifest 관련 설정을 저장한다.
