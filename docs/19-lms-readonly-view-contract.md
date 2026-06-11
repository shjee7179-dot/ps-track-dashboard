# LMS Readonly View Contract

이 문서는 AlphaCampus/LMS DB 명세와 PS Track이 요구하는 readonly view contract, 내부 매핑 모델을 정리한다.

2026-06-11 기준으로 `table.xlsx`의 `테이블 명세서` 시트를 확인했다. 원본에는 346개 테이블이 있으며, 보안상 실제 ID 값은 제공받지 않았다. 따라서 이 문서는 테이블명/컬럼명은 실제 명세 기반으로 기록하고, 개발용 식별자는 synthetic id로 둔다.

## Decision

LMS 연계는 원본 테이블 직접 통합이 아니라 readonly view 연계로 진행한다.

PS Track은 LMS 수료/참가 상태를 직접 판정하지 않는다. LMS가 제공하는 상태값과 완료 bucket을 인용하고, PS Track은 이를 학습 여정의 활성화/현황 표시/성과 연결에 사용한다.

## Current Assumptions

- LMS DBMS는 PostgreSQL 계열 readonly view/read replica 연계를 우선 가정한다.
- 접속은 VPC peering 기반 read replica 또는 readonly DB/view 접근을 전제로 한다.
- LMS 운영팀은 읽기 전용 계정을 제공할 수 있다.
- 수료/참가 실적 관련 view에는 회원정보, 콘텐츠 정보, 운영상태, 수료상태가 포함된다.
- 사용자 식별자는 Keycloak subject 또는 LMS user UUID와 매핑한다.
- PS Track의 기본 완료 판단은 `completed` / `not_completed` 두 bucket으로 단순화한다.
- 수료일, 진도율, 점수, 이수시간은 현황 값으로 조회하되 PS Track에서 별도 수료 기준 로직을 계산하지 않는다.
- 휴대폰은 원본이 아니라 masked value를 받는 것을 기본 요청으로 둔다.

## Source Table Extraction From `table.xlsx`

PS Track 1차 MVP에 필요한 source table은 전체 346개 중 아래 범위로 좁힌다. 실제 운영 연계는 원본 테이블 직접 조회가 아니라 LMS 운영팀이 제공하는 readonly view를 대상으로 한다.

| purpose | source table | key columns | required columns for view mapping |
| --- | --- | --- | --- |
| 사용자 식별 | `회원` | `사용자 ID`, `로그인 ID`, `이메일` | `사용자 ID`, `로그인 ID`, `이메일`, `성명`, `전화번호`, `과학기술인 번호` |
| 사용자 소속 | `회원소속` | `회원소속 ID`, `회원 ID`, `기관 ID` | `회원 ID`, `기관 ID`, `부서`, `이메일`, `직무분야`, `대표소속기관 여부` |
| 정규교육 수강/수료 | `등록_통계` | `수강 ID`, `신청자 ID`, `차수 ID`, `과정정보 과정 ID` | `수강 ID`, `진도율`, `수강 상태`, `점수`, `차수 ID`, `차수 명`, `수료 시간`, `수료 번호`, `학습자정보 학습자 ID`, `학습자정보 로그인아이디`, `학습자정보 이메일`, `학습자정보 휴대전화`, `과정정보 과정 ID`, `과정정보 과정 명`, `과정정보 과정유형` |
| 정규교육 수강/수료 보조 | `수강_통계` | `수강 ID`, `신청자 ID`, `차수 ID`, `과정정보 과정 ID` | `수강 ID`, `진도율`, `수강 상태`, `점수`, `차수 ID`, `차수 명`, `수료 시간`, `수료 번호`, `학습자정보 학습자 ID`, `학습자정보 로그인ID`, `학습자정보 이메일`, `학습자정보 휴대전화`, `과정정보 과정 ID`, `과정정보 과정 명`, `과정정보 과정유형` |
| 정규교육 신청 상세 | `등록` | `수강 신청 ID`, `신청 사용자 ID`, `차수 ID` | `수강 신청 ID`, `상태_입과상태(승인2)`, `신청 시간`, `수강 시작일`, `수강 종료일`, `수료 시간`, `수료번호`, `수료정보 사용자 ID`, `수료정보 과정 ID`, `수료정보 과정 명`, `수료정보 차수 ID`, `수료정보 차수 명` |
| 정규교육 과정 catalog | `과목` | `과정 ID` | `과정 ID`, `과정명`, `과정 유형`, `상태`, `교육시간`, `사용여부` |
| 정규교육 차수 catalog | `시퀀스` | `차수 ID`, `과정 ID` | `차수 ID`, `과정 ID`, `차수 명`, `신청 시작 일시`, `신청 종료 일시`, `학습시작 일시`, `학습종료일시`, `차수 공개여부`, `교육장소` |
| 정규교육 모듈 catalog | `시퀀스_모듈` | `차수모듈 ID`, `차수 ID` | `차수모듈 ID`, `차수 ID`, `차수모듈명`, `차수모듈순번`, `필수여부`, `모듈유형` |
| 정규교육 차시 catalog | `시퀀스_수업` | `차수차시 ID`, `차수 ID`, `차수 모듈 ID` | `차수차시 ID`, `차수 ID`, `차수 모듈 ID`, `콘텐츠 풀 ID`, `차수차시 순번`, `차시유형`, `필수여부`, `시작 일시`, `종료일시`, `학습 시간` |
| 콘텐츠 pool catalog | `콘텐츠_풀` | `콘텐츠 풀 ID` | `콘텐츠 풀 ID`, `콘텐츠풀 명`, `콘텐츠 유형`, `콘텐츠 코드`, `재생시간(초)`, `사용 여부` |
| 지식 콘텐츠 catalog | `채널_콘텐츠` | `채널 콘텐츠 ID`, `채널 ID` | `채널 콘텐츠 ID`, `채널 ID`, `콘텐츠명`, `상태`, `채널 콘텐츠 Type`, `수료기준`, `learning_time` |
| 지식 콘텐츠 학습 | `채널_학습` | `채널 학습 ID`, `콘텐츠 ID`, `학습자 ID` | `채널 학습 ID`, `완료 여부`, `완료 시간`, `콘텐츠 ID`, `콘텐츠 유형`, `진도율`, `학습자 ID`, `학습시간` |
| 전자책 catalog | `전자책_콘텐츠` | `전자책 콘텐츠 ID`, `상품번호 (13자리)` | `전자책 콘텐츠 ID`, `상품번호 (13자리)`, `콘텐츠명`, `콘텐츠구분 (001:전자책, 002:오디오북)`, `최대 인정시간`, `중지여부 (사용 : N, 중지 : Y)` |
| 전자책 학습 | `전자책_학습` | `전자책 학습 ID`, `회원 ID`, `상품번호 (13자리)` | `전자책 학습 ID`, `상품번호 (13자리)`, `수료여부 (Y:수료, N:미수료, P:학습중, B:재열람)`, `회원 ID`, `회원 로그인 ID`, `학습시간 (분 단위)` |
| 커뮤니티 catalog | `학습_랩` | `러닝랩 ID` | `러닝랩 ID`, `상태 1:신청, 2:승인, 3:반려, 4:종료`, `학습모임 타입`, `시작일`, `종료일`, `이수시간` |
| 커뮤니티 참여 | `학습_랩_회원` | `학습모임 멤버 ID`, `러닝랩 ID`, `사용자 ID` | `학습모임 멤버 ID`, `러닝랩 ID`, `사용자 ID`, `학습모임 맴버 상태`, `학습모임 맴버 유형`, `이수시간`, `참여 여부` |

### Synthetic IDs For Development

실제 UUID/ID는 보안상 수령 전까지 코드와 seed에 넣지 않는다. 개발용 값은 아래 namespace를 사용한다.

| logical id | synthetic value |
| --- | --- |
| LMS user | `lms-user-synthetic-001` |
| Keycloak subject | `keycloak-subject-synthetic-001` |
| Regular course | `lms-course-synthetic-ps-track-2026` |
| Regular course round | `lms-round-synthetic-ps-track-2026-01` |
| Enrollment/learning record | `lms-enrollment-synthetic-001` |
| Content pool | `lms-content-pool-synthetic-001` |
| Channel content | `lms-channel-content-synthetic-001` |
| E-book content | `lms-ebook-content-synthetic-001` |
| Learning lab | `lms-learning-lab-synthetic-001` |

The matching TypeScript contract lives in `src/lib/lms/source-table-contract.ts`.

`src/lib/lms/readonly-adapter.ts` provides the current `LMS_PROVIDER=none|mock-view` adapter. `mock-view` uses only synthetic IDs and sanitized sample records so screens can be developed before real LMS IDs are available.

`/admin/lms-content-mappings` uses this adapter when `LMS_PROVIDER=mock-view`. Operators select an LMS catalog item instead of manually typing `lms_content_id`; the server action then reloads the catalog record and resolves `lms_content_id`, `lms_course_round_id`, `content_group`, and `content_type`.

## Required LMS Views

### 1. `lms_content_catalog_view`

운영자가 AlphaCampus에 개설된 콘텐츠를 조회하고 PS Track 학습피스에 매핑하기 위한 view다.

| column | expected type | nullable | description |
| --- | --- | --- | --- |
| `lms_content_id` | text/uuid | no | LMS 콘텐츠 고유 식별자 |
| `lms_course_round_id` | text/uuid | yes | 과정/차수 고유 식별자 |
| `content_group` | text | no | `regular`, `subscription`, `community` |
| `content_type` | text | no | `offline`, `realtime`, `hyflex`, `online`, `knowledge`, `ebook`, `learning_group`, `seminar` |
| `content_title` | text | no | 콘텐츠명 |
| `course_round_title` | text | yes | 과정/차수명 |
| `provider_org` | text | yes | 운영/제공 기관 |
| `open_status_code` | text | yes | LMS 개설/운영상태 코드 |
| `open_status_label` | text | yes | LMS 개설/운영상태 표시명 |
| `apply_starts_at` | timestamptz/date | yes | 신청 시작일 |
| `apply_ends_at` | timestamptz/date | yes | 신청 종료일 |
| `learning_starts_at` | timestamptz/date | yes | 학습 시작일 |
| `learning_ends_at` | timestamptz/date | yes | 학습 종료일 |
| `updated_at` | timestamptz | yes | LMS 기준 최종 수정 시각 |

### 2. `lms_learning_record_view`

학습자의 신청/참가/수료 실적을 조회하기 위한 view다. 하나의 view에 수강 신청, 참가, 수료 상태가 모두 포함되는 것을 우선 가정한다.

| column | expected type | nullable | description |
| --- | --- | --- | --- |
| `lms_record_id` | text/uuid | no | LMS 학습/수료 실적 row 식별자 |
| `lms_user_id` | text/uuid | no | LMS 사용자 UUID |
| `keycloak_subject` | text/uuid | yes | Keycloak subject. LMS user id와 다를 경우 매핑용 |
| `user_name` | text | yes | 표시용 이름 |
| `user_email` | text | yes | 표시용 이메일 |
| `user_phone_masked` | text | yes | 마스킹된 휴대폰 번호 |
| `lms_content_id` | text/uuid | no | 콘텐츠 고유 식별자 |
| `lms_course_round_id` | text/uuid | yes | 과정/차수 고유 식별자 |
| `content_group` | text | no | 정규교육과정/구독/커뮤니티 bucket |
| `content_type` | text | no | 세부 콘텐츠 유형 |
| `content_title` | text | no | 콘텐츠명 |
| `course_round_title` | text | yes | 과정/차수명 |
| `participation_status_code` | text | yes | 신청/입과/참가 상태 코드 |
| `participation_status_label` | text | yes | 신청/입과/참가 상태 표시명 |
| `completion_status_code` | text | yes | LMS 수료 상태 코드 |
| `completion_status_label` | text | yes | LMS 수료 상태 표시명 |
| `completion_bucket` | text | yes | `completed` 또는 `not_completed` |
| `progress_rate` | numeric | yes | 진도율 |
| `score` | numeric | yes | 점수 |
| `learning_time_minutes` | int | yes | 이수/학습 시간 |
| `started_at` | timestamptz/date | yes | 학습 시작일 |
| `completed_at` | timestamptz/date | yes | 수료일 |
| `updated_at` | timestamptz | yes | LMS 기준 최종 수정 시각 |

## Content Groups

| group | examples |
| --- | --- |
| `regular` | 집합, 실시간, 하이플렉스, 온라인 |
| `subscription` | 지식, 전자책 |
| `community` | 학습모임, 세미나 |

## Internal PS Track Mapping Model

PS Track 내부에는 LMS 콘텐츠와 학습피스를 연결하는 매핑 모델이 필요하다.

```text
lms_content_mappings
- id
- cohort_id
- module_id
- content_id
- learning_piece_id
- lms_content_id
- lms_course_round_id
- content_group
- content_type
- required
- activation_rule
- status
- created_by
- created_at
- updated_at
```

## `lms_content_mappings` Schema Draft

This table is owned by PS Track, not LMS. It stores the operator's decision that a specific LMS content/course round corresponds to a PS Track learning piece.

| column | type | note |
| --- | --- | --- |
| `id` | uuid | primary key |
| `cohort_id` | uuid | PS Track cohort |
| `module_id` | text | PS Track module id, text until domain tables migrate |
| `content_id` | text | PS Track content id, text until domain tables migrate |
| `learning_piece_id` | text | PS Track learning piece id |
| `lms_content_id` | text | LMS readonly content id |
| `lms_course_round_id` | text | LMS course/session/round id |
| `content_group` | text | `regular`, `subscription`, `community` |
| `content_type` | text | detailed LMS content type |
| `required` | boolean | whether this mapping is required for the journey |
| `activation_rule` | text | `record_exists`, `participation_active`, `completion_completed` |
| `status` | text | `draft`, `active`, `inactive` |
| `created_by` | uuid | operator/admin user id |
| `created_at` | timestamptz | creation time |
| `updated_at` | timestamptz | update time |

Constraints:

- one PS Track learning piece mapping per cohort and learning piece
- one LMS content/course round target per cohort, treating an empty round id as one target
- status and type values are checked in DB

Repository contract:

```text
LmsContentMappingRepository
- listMappings(query)
- getMappingById(mappingId)
- getMappingByLearningPiece(cohortId, learningPieceId)
- createMapping(input)
```

### Activation Rule

| rule | meaning |
| --- | --- |
| `record_exists` | LMS 학습/참가 실적 row가 생기면 학습피스 활성화 |
| `participation_active` | 신청/참가 상태가 active 계열이면 활성화 |
| `completion_completed` | LMS 완료 bucket이 completed일 때 완료 처리 |

## Recommended Workflow

### Default: Operator Pre-Mapping

1. 운영자가 `lms_content_catalog_view`에서 AlphaCampus 콘텐츠를 조회한다.
2. 운영자가 LMS 콘텐츠를 PS Track `module/content/learning_piece`에 매핑한다.
3. 운영자가 학습자에게 AlphaCampus 신청/입과를 안내하거나 단체 입과를 처리한다.
4. LMS에 학습/수료 실적 row가 생성된다.
5. PS Track은 `lms_learning_record_view`를 user + content/course key로 조회한다.
6. 매핑된 학습피스가 활성화되고 LMS 상태/진도/수료일이 표시된다.

### Secondary: Student Self-Link

1. 학습자가 AlphaCampus에서 신청한 내역을 PS Track에서 조회한다.
2. 학습자가 본인 신청 내역 중 PS Track 여정에 연결할 항목을 선택한다.
3. PS Track은 운영자 사전 매핑과 일치하는지 우선 검증한다.
4. 일치하지 않으면 운영자 승인 또는 예외 매핑 대상으로 보낸다.

이 흐름은 예외/보조 기능이다. 기본값은 운영자 사전 매핑이다.

## Provider Contract

```text
LMS_PROVIDER=none | mock-view
```

| provider | meaning |
| --- | --- |
| `none` | LMS 연계를 사용하지 않음 |
| `mock-view` | 실제 LMS 명세 전, readonly view contract 기반 mock adapter 사용 |

실제 LMS DBMS와 view 명세가 확정되면 후속 provider를 추가한다.

```text
LMS_PROVIDER=readonly-db
```

## Open Questions For LMS Operations Team

1. `등록_통계`와 `수강_통계` 중 운영팀이 canonical 수강/수료 view로 권장하는 source는 무엇인가?
2. 제공 view 이름은 무엇인가?
3. view 명세서에 column name, type, nullable, description, sample value가 포함되는가?
4. Keycloak subject와 `회원`.`사용자 ID`가 같은가?
5. 다르다면 어떤 claim 또는 컬럼으로 매핑해야 하는가?
6. 정규교육, 구독/지식, 전자책, 커뮤니티를 하나의 `lms_learning_record_view`로 통합 제공할 수 있는가?
7. `completion_bucket`을 LMS view에서 `completed` / `not_completed`로 제공할 수 있는가?
8. 휴대폰은 원본이 아니라 masked value로 제공 가능한가?
9. `updated_at` 또는 이에 준하는 변경 기준 컬럼으로 증분 조회가 가능한가?
10. read replica/view 접근 계정은 어떤 VPC peering endpoint와 port를 사용하는가?

## Stop Line Before Real Integration

실제 LMS DBMS, view 명세, 사용자 식별자 매핑, 상태 코드 목록을 받기 전에는 실제 DB adapter를 구현하지 않는다.

그 전까지는 contract 문서, 내부 mapping model, mock-view adapter skeleton까지만 진행한다.
