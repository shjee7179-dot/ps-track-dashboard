# Work History

이 문서는 미래 의사과학자 챌린지 트랙 학습 여정 대시보드 개발 흐름을 추후 구조화해 정리할 수 있도록 남기는 작업 기록이다. 프로젝트가 끝날 때까지 유지하며, 큰 방향 전환이나 PR 단위 작업이 끝날 때마다 갱신한다.

## 운영 원칙

- 초반에는 세부 task를 과도하게 쪼개기보다, 작동하는 MVP 지도를 먼저 만든다.
- 학생 개인 기준을 기본 축으로 두고, 객체와 일정은 필터와 연결 정보로 붙인다.
- 화면은 넓게 만들되, 완료 상태는 나중에 `Mock`, `Functional`, `Verified`, `Deferred`로 구분해 보완한다.
- 코드 구조는 처음부터 완벽히 분리하기보다, 관계가 보인 뒤 자연스러운 경계로 모듈화한다.
- 각 작업은 작은 PR 단위로 병합하고, build 검증을 완료 기준에 포함한다.

## 기획 결정 히스토리

### 시스템 정체성

- 시스템명: 미래 의사과학자 챌린지 트랙 학습 여정 대시보드
- 핵심 관점: 학생 개인 기준 학습 여정
- 보조 관점: 객체, 일정, 산출물, 성과, 멘토링, 운영 리스크
- 개발 방식: 바이브코딩 기반으로 MVP 윤곽을 빠르게 만든 뒤 반복 보강

### 역할과 권한

- 사용자 역할: 학생참여자, 프로그램운영자, 연구책임자/PI, 멘토, 시스템 총괄 관리자
- 권한 모델: 처음부터 `role + scope` 구조로 설계
- scope 후보: system, program, cohort, track, team, student

### 운영 주기

- 2026년도 프로그램은 6월 협약 후 7월부터 10월까지 운영
- 이후 기수별 반복 운영을 전제로 설계
- 기수 복제 시 1~6번 성격의 템플릿 데이터는 복제 가능
- 실제 운영 데이터와 로그성 데이터는 복제하지 않음
- 일정은 실제 날짜 대신 상대 일정 템플릿을 둔다

### 객체 구조

- 기본 구조: module -> content -> learning piece -> artifact/outcome
- 콘텐츠 범위: 강의, 읽기자료, 워크숍, 과제, 실습, 링크, 오프라인 활동
- 운영 공지는 콘텐츠와 분리된 별도 notice 객체로 관리
- 산출물은 개인/팀 모두 가능하고, 여러 개 존재할 수 있음

### 멘토링

- 화상/채팅은 외부 도구 링크로 처리
- 시스템은 멘토링의 기록, 후속 액션, 산출물 연결, 피드백을 관리

### 대시보드 관점

- 학생 화면: 해야 할 일 중심, 성장감은 보조 축
- PI 화면: 성과와 품질 중심, 운영 현황은 요약
- 운영자 화면: 조치 가능한 신호 중심

## 구현 히스토리

### Sprint 0 성격의 기반 작업

- `ps-track-dashboard` 앱을 별도 프로젝트로 분리
- GitHub 신규 리포지토리 생성
- Next.js 기반 앱 골격 생성
- 로컬 개발 서버로 화면 확인
- 기본 문서 세트 작성: IA, MVP scope, PRD, SRS, roadmap, permission model, route map

### MVP 화면 골격

- 역할별 대시보드 구현
- 학생 여정 화면 구현
- 모듈, 콘텐츠, 학습피스 객체 화면 구현
- 산출물 목록, 상세, 리뷰, 평가 화면 구현
- 성과/학습성과 화면 구현
- 멘토링 목록과 상세 기록 화면 구현
- 리스크/리마인더 운영 화면 구현
- 설문/응답 기초 화면 구현
- 리포트/CSV 내보내기 화면과 API 구현
- 사용자, 역할/scope, 감사 로그, 접속 로그, PWA 설정, 시스템 설정 화면 구현

### 병합된 PR 흐름

- PR #10: route access policy 기반 페이지 보호
- PR #11: mock session helper 추가
- PR #12: domain type 분리
- PR #13: mock data 분리
- PR #14: permission helper 분리
- PR #15: report/export helper 분리
- PR #16: mentoring helper 분리와 작업 히스토리 문서 생성
- PR #17: risk/reminder helper 분리
- PR #18: journey helper 분리
- PR #19: artifact helper 분리
- PR #20: evaluation/outcome helper 분리
- PR #21: MVP completion ledger 작성
- PR #22: Auth/session + persistence 전환 준비
- PR #23: mock repository implementation 추가
- PR #24: session helper를 SessionProvider contract에 맞게 보강
- PR #25: 학생 대시보드를 repository 경유로 전환하고 LMS 연동을 Future Integration Track으로 분리
- PR #26: 학습피스 상태 변경 server action guard 구현
- PR #27: 산출물 제출 server action guard 구현
- PR #28: 산출물 피드백 생성 server action guard 구현
- PR #29: 산출물 루브릭 평가 제출 server action guard 구현
- PR #30: 멘토링 기록 저장 server action guard 구현
- PR #31: 리스크/리마인더 조치 상태 저장 server action guard 구현
- PR #32: 남은 mock action/read path completion pass
- PR #33: 주요 read-heavy route repository 전환 확대
- PR #34: 학생별 여정 목록/상세 repository 전환
- PR #35: 산출물 상세/리뷰/평가 repository 전환
- PR #36: 멘토링 상세 repository 전환
- PR #37: 학습성과 목록/상세 repository 전환
- PR #38: 기수/팀 상세 repository 전환
- PR #39: Supabase/Auth 전환 경계와 환경 계약 준비
- PR #40: Core Auth/Scope Schema SQL 초안 작성
- PR #41: Supabase SDK 설치와 client factory 구현
- PR #42: Supabase session provider 초안 구현
- PR #43: `AUTH_PROVIDER=mock|supabase` switch 구현
- PR #44: users / role assignments DB-backed repository 구현
- PR #45: core seed/RLS SQL 초안 작성
- PR #46: AlphaCampus 인증 연동 독립 MSA 최종 목적지 문서화
- PR #47: Docker/container 실행 가능성 확보
- PR #48: AlphaCampus/Keycloak provider contract 구현
- PR #49: private PostgreSQL migration profile 추가

## 현재 진행 흐름

### Container 실행 가능성 확보

- 목적: 현재 MVP를 독립 MSA container로 빌드/실행할 수 있는 1차 배포 단위로 정리
- 산출물:
  - `Dockerfile`
  - `.dockerignore`
  - `docker-compose.yml`
  - `src/app/api/health/route.ts`
  - `docs/16-container-deployment.md`
  - `next.config.ts`
- 주요 결정:
  - Next.js `output: "standalone"`을 사용한다.
  - container 기본 provider는 `AUTH_PROVIDER=mock`, `REPOSITORY_PROVIDER=mock`이다.
  - `/api/health`를 container health check endpoint로 둔다.
  - PostgreSQL/Keycloak 연결은 후속 runtime profile/provider 작업으로 분리한다.
- 검증:
  - `npm run lint`, `npm run typecheck`, `npm run build` 통과
  - `.next/standalone/server.js`를 포트 3001에서 실행하고 `/api/health` 응답 확인
  - Docker CLI는 확인됐지만 Docker daemon socket이 없어 `docker build`는 현 세션에서 완료하지 못함
- 활용 방식: NHN Cloud 공공 환경 또는 AlphaCampus 컨테이너 운영 방식에 맞춘 배포 검증의 출발점으로 사용한다.

### AlphaCampus/Keycloak provider contract

- 목적: 최종 운영 목적지인 AlphaCampus/Keycloak 인증 연동을 현재 `SessionProvider` 구조 안에 끼울 수 있도록 1차 contract를 코드화
- 산출물:
  - `src/lib/keycloak/session-provider.ts`
  - `AUTH_PROVIDER=keycloak` switch
  - `User.externalSubject`
  - `UserRepository.getUserByExternalSubject()`
- 주요 결정:
  - 1차 provider는 Keycloak token 검증기를 직접 내장하지 않고 trusted header contract를 사용한다.
  - 운영 환경에서는 ingress, API gateway, reverse proxy, 또는 AlphaCampus 연계 WAS가 token 검증 후 `x-keycloak-sub`를 주입해야 한다.
  - PS Track은 `users.external_subject`로 앱 사용자와 매핑하고, 실제 권한은 자체 `role_assignments`로 결정한다.
  - Keycloak realm/client role만으로 PS Track의 role + scope 권한을 대체하지 않는다.
- 활용 방식: private PostgreSQL repository가 붙으면 `external_subject` 기반 사용자 조회가 그대로 운영 인증 흐름의 연결점이 된다.

### Private PostgreSQL migration profile

- 목적: Supabase validation track과 최종 private PostgreSQL 운영 target을 분리하고, 운영 DB 적용 기준선을 마련
- 산출물:
  - `db/private-postgres/README.md`
  - `db/private-postgres/schema/001_core_auth_scope.sql`
  - `db/private-postgres/seed/001_core_auth_scope_seed.sql`
  - `db/private-postgres/policies/README.md`
  - `docs/17-private-postgres-migration.md`
  - optional `postgres` docker compose profile
- 주요 결정:
  - Supabase용 `auth.users` FK와 `auth.uid()` RLS는 운영 private PostgreSQL에 그대로 적용하지 않는다.
  - 운영용 users table은 `external_subject`를 Keycloak/AlphaCampus 식별자 연결점으로 둔다.
  - DB는 private network에 두고 WAS container에서만 접근한다.
  - permission은 `SessionProvider`와 앱 레벨 guard를 1차 기준으로 둔다.
- 활용 방식: 이후 `REPOSITORY_PROVIDER=postgres` adapter를 붙일 때 schema와 env contract의 기준점으로 사용한다.
- 검증:
  - `docker compose config` 통과
  - `docker compose --profile postgres config` 통과
  - 현재 로컬에는 `psql` CLI가 없고 Docker daemon socket이 없어 실제 PostgreSQL container 실행과 SQL 적용은 보류

### PostgreSQL client/query helper

- 목적: 최종 private PostgreSQL target을 위한 첫 repository adapter 구현 경로를 확보
- 산출물:
  - `pg`, `@types/pg` dependency
  - `src/lib/postgres/env.ts`
  - `src/lib/postgres/client.ts`
  - `src/lib/postgres/repositories.ts`
  - `REPOSITORY_PROVIDER=postgres` selector
- 주요 결정:
  - 1차 adapter는 ORM/Query Builder가 아니라 `pg` 기반 명시적 SQL helper를 사용한다.
  - 이유는 SQL 가시성, 한국 공공/SI 유지보수 친화성, MyBatis/Spring 전환 가능성을 우선하기 때문이다.
  - 현재 postgres-backed 범위는 `users`와 `role_assignments`다.
  - 나머지 repository domain은 기존 `mockRepositories` fallback을 유지한다.
- 보안/운영 메모:
  - `DATABASE_URL`은 server-only runtime env로만 사용한다.
  - `POSTGRES_SSL`은 관리형/private PostgreSQL TLS 요구 시 켠다.
  - 실제 DB 연결 검증은 `psql` 또는 Docker daemon 준비 후 진행한다.
- 취약점 메모:
  - `npm audit --json` 기준 moderate 2건은 새 `pg`가 아니라 기존 `next` -> bundled `postcss <8.5.10` 경로에서 보고된다.
  - `npm audit fix --force`는 Next major downgrade를 제안하므로 이번 PR에서는 적용하지 않는다.

### Docker/PostgreSQL local verification

- 목적: 이전에 Docker daemon 부재로 보류했던 container build, PostgreSQL profile, schema/seed 적용을 실제 로컬 Docker에서 검증
- 실행/검증:
  - `docker info` 통과
  - `docker compose --profile postgres up -d postgres` 성공
  - PostgreSQL container `healthy` 확인
  - private PostgreSQL schema SQL 적용 성공
  - private PostgreSQL seed SQL 적용 성공
  - row count 확인: `users=5`, `role_assignments=5`, `teams=1`
  - `external_subject`와 role/scope 매핑 확인
  - `docker build -t ps-track-dashboard:local .` 성공
  - built image를 3002 포트로 실행하고 `/api/health` 응답 확인
- 운영 메모:
  - host에 `psql`이 없어 container 내부 `psql`로 SQL을 적용했다.
  - 3000 포트는 로컬 node 프로세스가 사용 중이라 앱 smoke container는 host 3002 포트로 검증했다.
  - smoke app container는 검증 후 제거했다.
  - PostgreSQL container는 다음 DB 검증을 위해 유지했다.
  - Docker build warning `SecretsUsedInArgOrEnv`는 `AUTH_PROVIDER` 이름에 대한 heuristic 경고로 보이며 실제 secret 노출은 아니다.

### Local Docker integration MVP decision

- 목적: 공공기관 보안망/존 분리 배포를 고려해, 로컬 Docker에서 운영 경계를 1차 검증할지 여부를 결정
- 결정:
  - 로컬 Docker에서 MVP 수준의 운영망 시뮬레이션을 1차 목표로 둔다.
  - 이 작업은 본선을 Docker 중심으로 전면 전환하는 것이 아니라 운영 전환 리스크를 줄이는 별도 검증 트랙이다.
  - 현재 화면/도메인 MVP와 provider/repository contract 흐름은 유지한다.
- 판단 근거:
  - Docker image build, PostgreSQL profile, schema/seed 적용, app health check가 이미 로컬에서 성공했다.
  - 최종 목적지는 AlphaCampus/Keycloak 인증 + 독립 private PostgreSQL + container 기반 MSA다.
  - WEB/WAS/DB zone, VPC peering, Keycloak, LMS readonly DB는 공공기관 배포의 핵심 리스크다.
  - 로컬 Docker network/profile은 실제 VPC peering을 완벽히 재현하지는 않지만 접근 경계와 env contract 검증에는 충분하다.
- 범위:
  - simulated public/was/db/auth/lms private networks
  - Keycloak local simulation
  - LMS mock PostgreSQL
  - LMS readonly adapter
  - `/api/ready` readiness endpoint
- 제외:
  - 실제 공공기관 클라우드 배포 자동화
  - 실제 LMS DB 전체 복제
  - LMS DB write integration
  - production-grade Keycloak 보안 완성
- 산출물:
  - `docs/18-local-docker-integration-mvp.md`

### Compose network skeleton

- 목적: Keycloak/LMS 세부 구현 전, 공공기관 운영망을 흉내 내는 Docker network 경계만 먼저 추가
- 사용자 결정 반영:
  - 1번 Compose network skeleton만 진행한다.
  - Keycloak 버전/환경은 별도 확인 후 다시 논의한다.
  - LMS mock DBMS와 table/schema shape는 LMS 운영팀 문의 후 다시 논의한다.
- 산출물:
  - `docker-compose.yml`에 `public_zone`, `was_zone`, `db_zone`, `auth_zone`, `lms_private_zone` network 추가
  - `ps-track-dashboard`는 `public_zone`, `was_zone`, `db_zone`, `auth_zone`, `lms_private_zone`에 연결
  - `postgres`는 `db_zone`에만 연결
  - Keycloak/LMS 서비스는 추가하지 않지만, app container가 auth/LMS network에 붙어 Docker가 local peering skeleton을 생성하게 한다.
  - PostgreSQL host port publish를 제거해 DB private zone 시뮬레이션을 강화했다.
  - PostgreSQL container 재생성 후 `healthy`와 기존 seed row count 유지 확인: `users=5`, `role_assignments=5`, `teams=1`
- 보류:
  - Keycloak container
  - Keycloak DB
  - LMS mock DB
  - LMS readonly adapter
  - `/api/ready`

### LMS readonly view contract

- 목적: Keycloak/LMS 실명세 수령 전에도 진행 가능한 LMS 연계 contract와 내부 매핑 모델을 고정
- 사용자 결정 반영:
  - 실제 LMS DB 연결은 view 명세, DBMS, 상태 코드, 사용자 식별자 매핑을 받기 전까지 구현하지 않는다.
  - 수료 판정은 PS Track에서 계산하지 않고 LMS view의 상태값과 `completion_bucket`을 인용한다.
  - 운영자 사전 콘텐츠 매핑을 기본 흐름으로 두고, 학습자 직접 선택은 보조/예외 흐름으로 둔다.
- 산출물:
  - `docs/19-lms-readonly-view-contract.md`
  - `src/lib/lms/contracts.ts`
  - `LMS_PROVIDER=none|mock-view` env contract
- 주요 모델:
  - `lms_content_catalog_view`
  - `lms_learning_record_view`
  - 내부 `lms_content_mappings` draft
- 중단선:
  - 실제 DB adapter는 LMS 운영팀의 view 명세와 DBMS 정보를 받은 뒤 구현한다.

### 다음 예정 작업

### LMS content mapping schema

- 목적: 운영자 사전 매핑 기본 흐름을 위해 PS Track이 자체 소유하는 LMS 콘텐츠-학습피스 매핑 테이블과 repository contract를 준비
- 산출물:
  - `db/private-postgres/schema/001_core_auth_scope.sql`에 `lms_content_mappings` 추가
  - `src/lib/lms/contracts.ts`에 `LmsContentMapping`, `LmsContentMappingRepository` 추가
  - `docs/19-lms-readonly-view-contract.md`에 schema/repository contract 설명 추가
- 주요 결정:
  - `lms_content_mappings`는 LMS 원본 테이블이 아니라 PS Track 내부 운영자 결정 테이블이다.
  - `module_id`, `content_id`, `learning_piece_id`는 아직 PS Track domain table migration이 완성되지 않았으므로 text로 둔다.
  - `cohort_id + learning_piece_id`는 하나의 매핑만 허용한다.
  - `cohort_id + lms_content_id + lms_course_round_id`도 중복을 막으며, `lms_course_round_id`가 비어 있는 콘텐츠도 하나의 target으로 취급한다.
  - 실제 LMS DB adapter 구현은 여전히 LMS 운영팀 view 명세 수령 후 진행한다.

### 다음 예정 작업

- `lms_content_mappings` mock/postgres repository implementation
- LMS 운영팀에 DBMS, view 명세, 사용자 UUID/Keycloak subject 매핑 확인
- Keycloak 버전/환경 확인
- 확인 결과에 따라 `mock-view` adapter skeleton 또는 `/api/ready` 기본형 선택

### LMS content mapping repository

- 목적: `lms_content_mappings` schema와 contract를 실제 repository provider 구조에 연결
- 산출물:
  - `src/lib/repository-contracts.ts`의 `AppRepositories`에 `lms.contentMappings` 영역 추가
  - `src/lib/mock-repositories.ts`에 mock `LmsContentMappingRepository` 구현 추가
  - `src/lib/postgres/repositories.ts`에 PostgreSQL `LmsContentMappingRepository` 구현 추가
  - `src/lib/repositories.ts` proxy에 provider switch 경유 접근 경로 추가
  - `docs/17-private-postgres-migration.md`의 현재 구현 범위와 다음 단계 갱신
- 주요 결정:
  - LMS content mapping은 `learning` domain에 섞지 않고 `lms.contentMappings` 하위로 분리한다.
  - `REPOSITORY_PROVIDER=postgres`일 때도 아직 migration이 끝나지 않은 domain은 mock fallback을 유지한다.
  - PostgreSQL 구현은 ORM 없이 명시적 SQL을 사용한다.
  - create/list/get 경로만 먼저 구현하고, update/delete/status action은 운영자 화면 설계 시 확장한다.

### 다음 예정 작업

- `lms_content_mappings` 운영자 매핑 화면 또는 server action 설계
- LMS 운영팀 view 명세 수령 전까지는 readonly LMS adapter 구현을 보류
- Keycloak 버전/환경 확인 후 auth provider runtime 검증

### LMS content mapping admin screen and action

- 목적: 운영자가 PS Track 학습피스와 AlphaCampus/LMS 콘텐츠 target을 직접 연결할 수 있는 1차 화면과 저장 action을 구현
- 산출물:
  - `/admin/lms-content-mappings` 운영자 화면 추가
  - `createLmsContentMappingAction` server action 추가
  - route access policy에 `LMS 매핑` 메뉴 추가
  - mock repository에도 DB와 동일한 중복 매핑 방지 규칙 추가
- 주요 결정:
  - LMS 콘텐츠 catalog view 명세 수령 전까지는 운영자 직접 입력 방식으로 먼저 구현한다.
  - 화면은 학습피스별 행 단위로 구성하고, 매핑되지 않은 학습피스에만 신규 매핑 폼을 노출한다.
  - 저장 action은 enum/input 검증, role+scope 권한 확인, `repositories.lms.contentMappings.createMapping` 호출, revalidate/redirect 순서로 처리한다.
  - 수정/비활성화/delete action은 실제 운영 흐름 확인 후 후속 PR에서 확장한다.

### 다음 예정 작업

- LMS content mapping update/status action 구현
- LMS readonly catalog view 명세 수령 시 catalog selector로 직접 입력 필드를 대체
- `REPOSITORY_PROVIDER=postgres` 화면 저장 경로를 Docker 앱 컨테이너에서 end-to-end 검증

### LMS content mapping status action

- 목적: 이미 생성된 LMS 콘텐츠 매핑을 운영자가 `draft`, `active`, `inactive` 상태로 전환할 수 있게 함
- 산출물:
  - `LmsContentMappingRepository.updateMappingStatus` contract 추가
  - mock/PostgreSQL repository status update 구현
  - `updateLmsContentMappingStatusAction` server action 추가
  - `/admin/lms-content-mappings` 기존 매핑 행에 상태 변경 폼 추가
- 주요 결정:
  - 상태 변경은 매핑의 `cohortId` 기준 `update` 권한으로 검사한다.
  - create와 동일하게 `repositories.lms.contentMappings` proxy를 경유해 provider 전환을 유지한다.
  - 삭제보다는 `inactive` 상태 전환을 1차 운영 기본값으로 둔다.

### 다음 예정 작업

- `REPOSITORY_PROVIDER=postgres` 화면 저장/상태 변경 경로를 Docker 앱 컨테이너에서 end-to-end 검증
- LMS readonly catalog view 명세 수령 시 catalog selector로 직접 입력 필드를 대체
- app runtime DB grant SQL 작성

### PostgreSQL LMS mapping E2E prep

- 목적: `/admin/lms-content-mappings` 화면을 `REPOSITORY_PROVIDER=postgres`로 실행할 때 발생할 수 있는 mock id와 PostgreSQL UUID FK 불일치를 제거
- 산출물:
  - PostgreSQL provider에 `cohorts.getActiveCohort()` 최소 구현 추가
  - `lms_content_mappings.created_by`는 UUID 형식일 때만 저장하고, mock auth 문자열 id는 `null`로 저장하도록 보호
- 주요 결정:
  - LMS mapping repository가 PostgreSQL을 사용할 때 화면의 `cohortId`도 PostgreSQL cohort UUID를 사용해야 한다.
  - `AUTH_PROVIDER=mock` + `REPOSITORY_PROVIDER=postgres` 조합은 개발 검증용이므로 `created_by` FK는 nullable 처리한다.
  - operator role은 mock assignment scope와 PostgreSQL cohort UUID가 다르므로, local postgres E2E는 우선 admin role로 검증한다. 실제 운영에서는 Keycloak/postgres session이 같은 DB scope를 사용해야 한다.
- 검증 상태:
  - Docker daemon이 실행 중이 아니어서 컨테이너 E2E는 보류
  - 코드 검증 후 Docker 실행 시 `REPOSITORY_PROVIDER=postgres` 경로로 재검증 예정

### 다음 예정 작업

- Docker daemon 실행 후 `REPOSITORY_PROVIDER=postgres` 화면 저장/상태 변경 E2E 재시도
- PostgreSQL app runtime user grant SQL 작성
- LMS readonly catalog view 명세 수령 시 catalog selector로 직접 입력 필드를 대체

### Confirmed AlphaCampus Keycloak environment

- 목적: LMS 운영팀이 공유한 Keycloak 운영 정보를 현재 auth/provider/infra 계획에 반영
- 수령 정보:
  - Keycloak `v26.0.4` on JDK 17
  - production realm `kird`
  - client id pattern `kird-[target-system-english-name]`; PS Track tentative value `kird-ps-track-dashboard`
  - client type `confidential`, client secret out-of-band 전달
  - JWT token verification은 AlphaCampus/LMS gateway에서 수행
  - 기본 claim은 LMS 회원 `uuid`, `email`, `username/login_id`
  - role claim은 필요 시 추가 가능
  - logout endpoint는 realm `kird`의 OIDC logout URL 사용
  - SSO session idle 2시간, max 10시간
  - local realm export 제공은 어려움
- 주요 결정:
  - 기존 trusted-header `AUTH_PROVIDER=keycloak` 방향은 유지한다.
  - PS Track primary external identity는 Keycloak/LMS member `uuid`를 `users.external_subject`에 저장한다.
  - `email`, `username/login_id`는 보조 식별자와 감사/동기화 진단값으로 둔다.
  - Keycloak role claim은 받아도 PS Track 내부 `role_assignments`를 대체하지 않는다.
  - client secret은 git, Dockerfile, Compose default, client bundle에 넣지 않는다.
  - local Keycloak simulation은 production realm export 없이 synthetic realm으로도 가치가 있는지 별도 판단한다.

### 다음 예정 작업

- redirect URI/callback URL 후보 확정 후 LMS 운영팀에 등록 요청
- Docker daemon 실행 후 PostgreSQL LMS mapping E2E 재시도
- Keycloak trusted-header runtime smoke route 또는 diagnostics 화면 설계

### Keycloak redirect URI candidates

- 목적: LMS/Keycloak 운영팀에 전달할 redirect/callback URL 후보를 확정
- 산출물:
  - `docs/20-keycloak-redirect-uri-candidates.md` 신규 작성
  - `docs/README.md` 문서 색인 추가
  - `docs/15-alphacampus-msa-boundary.md`에 후보 문서 링크 추가
- 주요 결정:
  - 현재 gateway-verified trusted-header 구조에서는 PS Track이 직접 OIDC callback을 받지 않는다.
  - 로그인 성공 후 기본 진입 URL은 `/dashboard`로 둔다.
  - 로그아웃 후 복귀 URL은 현재 존재하는 `/login`으로 둔다. production 전에는 mock role selector를 SSO re-entry 화면으로 조정해야 한다.
  - 직접 OIDC callback 후보 `/auth/callback/keycloak`은 future direct-OIDC 전환용으로만 보관한다.
  - 운영 DNS가 확정되지 않았으므로 host는 `[PS_TRACK_PUBLIC_HOST]` placeholder로 두고, 추천 후보는 `https://ps-track.alpha-campus.kr`로 기록한다.

### 다음 예정 작업

- 최종 public host 확정 후 LMS 운영팀에 `dashboard` / `login` URL 등록 요청
- production `/login` 화면을 SSO 재진입/로그아웃 랜딩 화면으로 조정
- Keycloak trusted-header runtime smoke route 또는 diagnostics 화면 설계

### Login route SSO landing mode

- 목적: PS Track이 자체 로그인하지 않고, 알파캠퍼스/LMS 로그인 이후 진입한다는 운영 전제를 `/login` 화면에 반영
- 산출물:
  - `src/app/login/page.tsx`가 `AUTH_PROVIDER`에 따라 분기
  - `AUTH_PROVIDER=mock`: 기존 역할 선택 화면 유지
  - `AUTH_PROVIDER=keycloak`: 알파캠퍼스 SSO 재진입/로그아웃 랜딩 화면 표시
  - route map, MVP ledger, redirect URI 후보 문서 갱신
- 주요 결정:
  - keycloak 모드의 `/login`은 credential 입력 화면이 아니다.
  - keycloak 모드의 `/login`은 gateway trusted-header 방식 설명과 `/dashboard` 재시도 링크만 제공한다.
  - 실제 로그인 시작 URL은 알파캠퍼스/LMS gateway 정책에 맡긴다.
- PR: #62, merged.

### 다음 예정 작업

- Keycloak trusted-header runtime smoke route 또는 diagnostics 화면 설계
- 최종 public host 확정 후 LMS 운영팀에 `dashboard` / `login` URL 등록 요청
- Docker daemon 실행 후 PostgreSQL LMS mapping E2E 재시도

### Keycloak trusted-header diagnostics

- 목적: 최종 public host 등록 요청 전에 AlphaCampus/LMS gateway가 전달할 trusted headers를 PS Track 내부에서 검증할 수 있게 준비
- 산출물:
  - `src/lib/keycloak/session-provider.ts`에 configured trusted-header name helper 추가
  - `src/lib/keycloak/diagnostics.ts`에 masked diagnostics helper 추가
  - `/admin/auth-diagnostics` 관리자 진단 화면 추가
  - `/api/auth/diagnostics` no-store JSON smoke endpoint 추가
- 주요 결정:
  - 진단 화면/API는 원문 JWT, client secret, 전체 UUID/email 값을 표시하지 않는다.
  - 응답은 header 존재 여부와 짧은 마스킹 preview만 제공한다.
  - 최종 LMS 운영팀 URL 등록 요청은 MVP 품질 검증 이후 마지막 단계로 유지한다.
- 검증:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
  - `AUTH_PROVIDER=keycloak` dev server에서 `/api/auth/diagnostics`에 synthetic trusted headers를 전달해 present/masked preview 확인
  - `AUTH_PROVIDER=keycloak` dev server에서 `/admin/auth-diagnostics?role=admin` 화면 렌더링 확인

### Docker/Postgres E2E retry

- 목적: Docker daemon 실행 후 `REPOSITORY_PROVIDER=postgres` 앱 컨테이너 E2E를 재시도
- 재현:
  - `docker compose --profile postgres ps`
  - `docker info`
  - `docker desktop status`
- 결과:
  - Docker CLI와 context는 확인되었으나, `desktop-linux` context가 Docker daemon socket에 연결하지 못했다.
  - `docker desktop status`도 "Could not retrieve status. Is Docker Desktop running?"으로 실패했다.
- 조치:
  - compose app service의 `AUTH_PROVIDER`, `REPOSITORY_PROVIDER`, `DATABASE_URL`, `POSTGRES_SSL`, `NEXT_PUBLIC_APP_URL`을 runtime env override 가능하게 변경했다.
  - `docker compose --profile postgres config`로 compose 문법을 검증했다.
  - `REPOSITORY_PROVIDER=postgres AUTH_PROVIDER=mock docker compose --profile postgres config`로 provider override 반영을 검증했다.
  - Docker Desktop daemon이 정상화되면 아래 명령으로 즉시 재시도한다.

```bash
REPOSITORY_PROVIDER=postgres AUTH_PROVIDER=mock docker compose --profile postgres up --build ps-track-dashboard
```

### Docker/Postgres E2E completed

- 목적: `REPOSITORY_PROVIDER=postgres` 앱 컨테이너에서 LMS content mapping create/status update가 실제 PostgreSQL repository를 경유하는지 검증
- 실행 환경:
  - Docker Desktop daemon 정상 연결 확인
  - `postgres:16-alpine` compose profile healthy
  - 앱 컨테이너 `AUTH_PROVIDER=mock`, `REPOSITORY_PROVIDER=postgres`
- 재현/검증:
  - `docker compose --profile postgres up -d postgres`
  - schema/seed SQL을 Postgres 컨테이너에 copy 후 `psql -f`로 적용
  - `REPOSITORY_PROVIDER=postgres AUTH_PROVIDER=mock docker compose --profile postgres up -d --build ps-track-dashboard`
  - `/api/health` 응답에서 `repositoryProvider: postgres` 확인
  - `/admin/lms-content-mappings?role=admin` 화면 렌더링 확인
  - 첫 번째 학습피스 `lp-001`에 `lms-content-smoke-001` mapping 생성
  - PostgreSQL `lms_content_mappings` row 생성 확인
  - 상태 변경 action으로 `draft -> active` 업데이트 확인
- 진단 교훈:
  - 상태 변경 form의 select는 시각적으로는 충분했지만 accessible label이 없어 브라우저 자동화가 아래 생성 form의 `상태` select를 잘못 잡았다.
  - 원인을 재현한 뒤 update form select에 `aria-label`을 추가했다.
  - 앞으로 반복 row의 select/button은 자동화와 보조기기 모두를 위해 고유한 label 또는 aria-label을 둔다.

### LMS table spec extraction

- 목적: `table.xlsx`에 포함된 AlphaCampus/LMS DB 테이블 명세에서 PS Track readonly view contract에 필요한 테이블명/컬럼명을 추출
- 입력:
  - `/Users/jeesanghyun/Downloads/table.xlsx`
  - sheet: `테이블 명세서`
  - 구조: `B열=테이블명`, `C열=컬럼명`
- 확인 결과:
  - 총 346개 테이블이 포함되어 있다.
  - PS Track 1차 연동 후보는 사용자, 정규교육 catalog/수강실적, 구독/전자책/커뮤니티 catalog/학습실적 테이블로 좁힌다.
- 산출물:
  - `docs/19-lms-readonly-view-contract.md`에 실제 source table/column 후보 추가
  - `src/lib/lms/source-table-contract.ts`에 TypeScript source table contract와 synthetic id namespace 추가
  - `src/lib/lms/contracts.ts`에 readonly source table name union 추가
  - `src/lib/lms/readonly-adapter.ts`에 `LMS_PROVIDER=none|mock-view` adapter와 synthetic LMS catalog/learning records 추가
- 결정:
  - 실제 ID 값은 보안상 받지 않았으므로 개발용 ID는 `*-synthetic-*` namespace를 사용한다.
  - 운영 연계는 원본 테이블 직접 조회가 아니라 LMS 운영팀이 제공하는 readonly view를 대상으로 유지한다.
  - `등록_통계`와 `수강_통계` 중 canonical 수강/수료 source는 LMS 운영팀 확인이 필요하다.

### LMS catalog selector for mappings

- 목적: `/admin/lms-content-mappings`에서 운영자가 LMS 콘텐츠 ID를 직접 입력하지 않고 readonly catalog view 후보를 선택할 수 있게 연결
- 산출물:
  - `LMS_PROVIDER=mock-view`일 때 `getLmsReadonlyViewAdapter().listContentCatalog()` 결과를 매핑 form select로 표시
  - catalog가 없거나 `LMS_PROVIDER=none`이면 기존 직접 입력 방식을 유지
  - `createLmsContentMappingAction`은 `lmsCatalogTarget`이 전달되면 server action 안에서 catalog를 다시 조회해 `lmsContentId`, `lmsCourseRoundId`, `contentGroup`, `contentType`을 확정
- 주요 결정:
  - catalog option 값만 신뢰하지 않고, server action에서 adapter를 다시 조회해 실제 record와 일치하는지 검증한다.
  - client-side JavaScript 없이 server-rendered form으로 구현한다.
  - 실제 LMS ID 수령 전까지는 `mock-view` synthetic catalog로 매핑 UI와 저장 흐름을 검증한다.

### LMS learning record overlay for student journey

- 목적: 운영자 LMS 콘텐츠 매핑 후 학생 여정 화면에서 LMS 수료/미수료 실적을 읽어 표시하는 end-to-end mock-view 연결
- 산출물:
  - `src/lib/lms/journey-overlay.ts`에 학생, active cohort, active LMS mapping, readonly learning record를 조합하는 overlay helper 추가
  - mock 학생 `student-001`에 synthetic Keycloak subject를 연결
  - 기본 mock LMS mapping을 `mock-view` synthetic catalog/learning record와 일치하도록 조정
  - `/student`, `/journeys/students/[studentId]`, `/objects/learning-pieces/[learningPieceId]`에 LMS 완료 상태 표시 추가
- 주요 결정:
  - 1차 구현에서는 LMS 수료 상태가 PS Track 내부 학습피스 상태를 자동으로 덮어쓰지 않는다.
  - LMS 상태는 학생 여정과 학습피스 상세의 참고 신호로 표시하고, 자동 완료 처리 정책은 별도 rule/action 단계에서 다룬다.
  - 실제 LMS view 명세 전까지는 `LMS_PROVIDER=mock-view`와 synthetic ID만 사용한다.

### LMS journey list summary

- 목적: 운영자/멘토가 학생 목록에서 LMS 수료 신호와 PS Track 상태 미반영 후보를 빠르게 확인
- 산출물:
  - `getStudentJourneyLmsSummary` helper 추가
  - `/journeys/students`를 repository 경유로 전환
  - 학생 목록 상단에 LMS 완료 건수와 상태 미반영 건수 표시
  - 학생 row badge에 학생별 LMS 완료/미반영 건수 표시
- 주요 결정:
  - “상태 미반영”은 LMS 완료 bucket은 `completed`지만 PS Track 학습피스 상태가 아직 `completed`가 아닌 경우로 정의한다.
  - 이 단계에서도 자동 동기화는 하지 않고 운영자가 조치할 수 있는 신호만 표시한다.

### LMS completion apply action

- 목적: LMS 수료 근거가 있는 학습피스를 운영자가 학생 상세 화면에서 PS Track 완료 상태로 반영
- 산출물:
  - `/journeys/students/[studentId]`에 `LMS 수료 반영 대기` 카드 추가
  - `applyLmsCompletionToLearningPieceStatusAction` server action 추가
  - action은 학생 scope 권한, 상태 레코드 존재, LMS 완료 bucket을 검증한 뒤 `completed`로 변경
  - 반영 후 학생 목록, 학생 상세, 학습피스 상세 경로를 revalidate
- 주요 결정:
  - LMS 상태가 PS Track 상태를 자동 변경하지 않고, 운영자 확인 버튼을 통해 반영한다.
  - “LMS 완료지만 PS Track 미완료” 항목만 반영 대상으로 노출한다.

### Postgres learning status repository

- 목적: LMS 완료 반영 action이 `REPOSITORY_PROVIDER=postgres`에서도 실제 상태 row를 갱신하도록 최소 persistence 범위를 확대
- 산출물:
  - private PostgreSQL schema에 `learning_piece_statuses` 테이블, 인덱스, updated_at trigger 추가
  - private PostgreSQL seed에 학생별 학습피스 상태와 synthetic LMS mapping seed 추가
  - `postgresLearningRepository` 추가: 상태 목록, 학생 여정, 요약, 상태 갱신을 Postgres로 처리
  - `users.external_subject` seed를 `keycloak-subject-synthetic-001`로 맞춰 `LMS_PROVIDER=mock-view` learning record overlay와 연결
- 검증:
  - `npm run lint`, `npm run typecheck` 통과
  - `docker compose --profile postgres config` 통과
  - 실제 Docker/Postgres E2E는 Docker daemon 미기동으로 보류
- 주요 결정:
  - `modules`, `contents`, `learning_pieces`는 아직 mock domain seed를 fallback으로 유지한다.
  - 지금 단계의 DB 전환 범위는 action persistence에 필요한 `learning_piece_statuses`로 제한한다.

### Postgres LMS completion E2E retry

- 목적: Docker Desktop 기동 후 `REPOSITORY_PROVIDER=postgres`, `LMS_PROVIDER=mock-view`에서 LMS 완료 반영 action E2E를 재시도
- 성공한 검증:
  - `docker compose --profile postgres ps`에서 Postgres와 앱 컨테이너 healthy 확인
  - private PostgreSQL schema SQL 적용 성공
  - private PostgreSQL seed SQL 적용 성공
  - DB 직접 확인 결과:
    - `learning_piece_statuses` row 5건
    - `student@example.kr`의 `external_subject = keycloak-subject-synthetic-001`
    - `lp-003` 상태가 `in_progress`
    - `lp-001`, `lp-003` LMS mapping active
  - 기존 앱 컨테이너는 `/api/health`에서 `repositoryProvider: postgres`로 응답
- 보류된 검증:
  - 최신 코드가 포함된 앱 이미지 빌드가 `resolve image config for docker-image://docker.io/docker/dockerfile:1` 단계에서 멈췄다.
  - `docker compose up --build`와 `docker build --progress plain` 모두 같은 지점에서 정지했다.
  - 기존 이미지로 앱 컨테이너를 복구했지만, HTML 확인 결과 최신 `LMS 수료 반영 대기` 카드가 포함되지 않은 오래된 이미지였다.
- 판단:
  - DB 적용과 seed는 검증 완료.
  - 최신 앱 컨테이너 E2E는 Docker registry/credential/frontend resolve 문제가 풀린 뒤 재시도해야 한다.
  - 현재 서비스는 기존 이미지로 healthy 상태까지 복구했다.

### Docker/Postgres LMS completion E2E completed

- 목적: 앞선 Docker frontend/base image resolution 보류 상태를 해소하고, 컨테이너 환경에서 LMS 완료 반영 action을 끝까지 검증
- 산출물:
  - `Dockerfile`의 Dockerfile frontend registry 의존을 제거하고 `NODE_IMAGE` build arg를 추가
  - local/offline 검증 시 `--build-arg NODE_IMAGE=ps-track-dashboard:local`로 사전 반입된 base image를 사용할 수 있게 조정
  - deps stage에서 dev dependency가 설치되도록 `npm ci --include=dev` 적용
  - stale image와 provider 누락을 빠르게 찾기 위해 `/api/health`에 `lmsProvider` 표시 추가
  - `docker-compose.yml`이 `LMS_PROVIDER`를 앱 컨테이너에 전달하도록 수정
  - Postgres repository가 mock route alias(`student-001`)를 DB user email로 해석하도록 보강
- 검증:
  - `npm run lint`, `npm run typecheck`, `npm run build` 통과
  - `docker build --progress plain --build-arg NODE_IMAGE=ps-track-dashboard:local -t ps-track-dashboard:local .` 통과
  - `AUTH_PROVIDER=mock`, `REPOSITORY_PROVIDER=postgres`, `LMS_PROVIDER=mock-view` 앱 컨테이너 재기동 성공
  - `/api/health`에서 `authProvider=mock`, `repositoryProvider=postgres`, `lmsProvider=mock-view` 확인
  - `/journeys/students/student-001?role=admin`에서 `LMS 완료 2개`와 `LMS 수료 반영 대기` 버튼 확인
  - 브라우저에서 `완료 반영` 클릭 후 URL에 `lmsSync=accepted`가 붙고 대기 버튼이 사라짐
  - Postgres `learning_piece_statuses.lp-003`가 `in_progress`에서 `completed`로 변경됨
- 오진/교훈:
  - 최초에는 DB/overlay 연결 문제처럼 보였지만 실제 원인은 `docker-compose.yml`에서 `LMS_PROVIDER`가 컨테이너에 전달되지 않은 설정 누락이었다.
  - `/api/health`가 repository provider만 보여주면 LMS provider 누락을 놓치기 쉬우므로 provider 진단값을 함께 노출한다.
  - Docker Hub 접근이 불안정하거나 폐쇄망에 가까운 환경에서는 base image 사전 반입과 build arg 경로가 필요하다.

### Postgres domain object read tables

- 목적: `modules`, `contents`, `learning_pieces` 정의를 mock fallback에서 private PostgreSQL read path로 전환
- 산출물:
  - private PostgreSQL schema에 `modules`, `contents`, `learning_pieces` table, index, updated_at trigger, comments 추가
  - private PostgreSQL seed에 MVP 기본 module 3건, content 5건, learning piece 5건 추가
  - `postgresLearningRepository`의 `listModules`, `listContents`, `listLearningPieces`, `getLearningPieceById`를 DB read로 전환
  - `/objects/learning-pieces` 목록 화면을 repository 기반으로 전환
  - Postgres 상태 row의 실제 UUID와 mock route alias(`student-001`) 비교 불일치로 `미지정`이 뜨던 상세/목록 표시를 수정
- 검증:
  - local Postgres container에 schema/seed 적용 성공
  - DB count 확인: `modules=3`, `contents=5`, `learning_pieces=5`
  - `npm run lint`, `npm run typecheck`, `npm run build` 통과
  - `docker build --progress plain --build-arg NODE_IMAGE=ps-track-dashboard:local -t ps-track-dashboard:local .` 통과
  - `REPOSITORY_PROVIDER=postgres`, `LMS_PROVIDER=mock-view` 컨테이너 재기동 후 `/api/health` 정상
  - `/objects/learning-pieces`에서 5개 학습피스와 상태 badge 렌더링 확인
  - `/objects/learning-pieces/lp-003?role=admin`에서 모듈/콘텐츠/성과태그와 `진행 중` 상태 렌더링 확인
- 오진/교훈:
  - repository가 alias를 받아 DB UUID로 조회하더라도 반환 객체의 `studentId`는 실제 DB UUID다.
  - 이미 studentId로 필터된 결과를 화면에서 다시 mock alias와 비교하면 Postgres 전환 후 상태가 사라진다.

### Private Postgres app runtime grants

- 목적: migration owner와 app runtime DB user를 분리하기 위한 최소 권한 grant SQL 작성
- 산출물:
  - `db/private-postgres/grants/001_app_runtime_user.sql` 추가
  - SQL은 `-v app_role=...`로 기존 runtime role을 받아 grant만 수행하고, 계정 생성/비밀번호 저장은 하지 않는다.
  - 현재 repository read 대상 테이블에 `select` 권한을 부여한다.
  - 현재 mutation 대상인 `learning_piece_statuses`, `lms_content_mappings`에만 `insert`, `update` 권한을 부여한다.
  - private Postgres README, policy note, migration 문서에 적용 순서와 원칙 반영

### Postgres artifact repository

- 목적: 산출물 목록/상세/리뷰 화면과 제출/피드백 action을 private PostgreSQL repository 경유로 전환
- 산출물:
  - private PostgreSQL schema에 `artifacts`, `submissions`, `feedback` table, index, updated_at trigger, comments 추가
  - private PostgreSQL seed에 MVP 산출물 3건, 제출 2건, 피드백 2건 추가
  - app runtime grant SQL에 산출물 관련 table select/insert/update 권한 추가
  - `postgresArtifactRepository`의 목록/상세/제출/피드백 read-write 구현
  - `/artifacts`, `/artifacts/[artifactId]`, `/artifacts/[artifactId]/review` read path를 repository 기반으로 전환
  - 제출/피드백 server action을 repository create method로 연결
- 설계 판단:
  - full Keycloak/Postgres session cutover 전까지 산출물 owner/submission/feedback 식별자는 `student-001`, `team-001`, `mentor-001` 같은 안정 alias text를 유지한다.
  - 실제 운영 전환 시에는 `users.external_subject` 또는 내부 `users.id`로 별도 migration할 수 있도록 repository boundary 안에 격리한다.
- 검증:
  - local Postgres container에 schema/seed/grant SQL 적용 성공
  - DB count 확인: `artifacts=3`, `submissions=2`, `feedback=2`
  - `npm run lint`, `npm run typecheck`, `npm run build` 통과
  - `docker build --progress plain --build-arg NODE_IMAGE=ps-track-dashboard:local -t ps-track-dashboard:local .` 통과
  - `REPOSITORY_PROVIDER=postgres`, `AUTH_PROVIDER=mock`, `LMS_PROVIDER=mock-view` 앱 컨테이너 재기동 후 `/api/health` 정상
  - `/artifacts?role=admin`, `/artifacts/artifact-001?role=student`, `/artifacts/artifact-001/review?role=operator` 렌더링 확인
  - artifact-002 제출 action 호출 후 `/artifacts/artifact-002?role=student`에서 `postgres-submission` audit와 제출 이력 표시 확인
  - artifact-002 피드백 action 호출 후 `/artifacts/artifact-002/review?role=admin`에서 `postgres-feedback` audit와 리뷰 큐 표시 확인
- 오진/교훈:
  - UI read path만 repository로 바꾸면 충분해 보이지만, server action create path까지 같은 repository contract로 묶어야 Docker/Postgres E2E에서 실제 저장을 검증할 수 있다.

### Postgres evaluation/outcome repository

- 목적: 평가 루브릭, 평가 제출, 학습성과 증거/집계 화면을 private PostgreSQL repository 경유로 전환
- 산출물:
  - private PostgreSQL schema에 `learning_outcomes`, `rubrics`, `rubric_items`, `evaluations`, `evaluation_item_scores`, `outcome_evidence` table, index, updated_at trigger, comments 추가
  - private PostgreSQL seed에 MVP 학습성과 5건, 루브릭 2건, 루브릭 항목 7건, 평가 2건, 항목 점수 7건, 성과 증거 4건 추가
  - app runtime grant SQL에 평가/성과 관련 table select 및 평가 제출에 필요한 insert/update 권한 추가
  - `transactionPostgres` helper 추가
  - `postgresEvaluationRepository`의 학습성과/루브릭/평가/점수/증거 read path와 평가 제출 write path 구현
  - `/artifacts/[artifactId]/evaluation`, `/outcomes`, `/outcomes/[outcomeId]` read path를 repository 기반으로 전환
  - 평가 제출 server action을 Postgres transaction 기반 create method로 연결
- 설계 판단:
  - 평가 제출은 evaluation, item scores, outcome evidence를 하나의 transaction으로 묶어 중간 저장 실패 시 성과 집계가 어긋나지 않게 한다.
  - full Keycloak/Postgres session cutover 전까지 평가자/학생 식별자는 기존 mock alias와 DB UUID가 함께 존재하므로 repository boundary에서 최소 변환만 수행한다.
  - 팀 산출물의 학생 성과 증거 귀속은 MVP 임시 fallback으로 `student-001`에 둔다. 실제 운영에서는 팀 멤버별 attribution 정책을 별도 확정해야 한다.
- 검증:
  - `npm run typecheck`, `npm run lint`, `npm run build` 통과
  - local Postgres container에 schema/seed/grant SQL 적용 성공
  - DB count 확인: `learning_outcomes=5`, `rubrics=2`, `rubric_items=7`, `evaluations=2`, `evaluation_item_scores=7`, `outcome_evidence=4`
  - `docker build --progress plain --build-arg NODE_IMAGE=ps-track-dashboard:local -t ps-track-dashboard:local .` 통과
  - `REPOSITORY_PROVIDER=postgres`, `AUTH_PROVIDER=mock`, `LMS_PROVIDER=mock-view` 앱 컨테이너 재기동 후 `/api/health` 정상
  - `/artifacts/artifact-001/evaluation?role=admin`에서 seed 평가 `12/15` 렌더링 확인
  - 평가 제출 action 호출 후 Postgres에 새 evaluation 1건, item score 3건, outcome evidence 3건 추가 확인
  - 새 컨테이너에서 `/artifacts/artifact-001/evaluation?role=admin&update=submitted&audit=postgres-evaluation`가 최신 평가 `14/15`와 `Postgres evaluation action verification` 코멘트를 렌더링
  - `/outcomes/outcome-001?role=admin`에서 새 증거 반영 후 평균 `87%`, 증거 `2건`, 점수 합계 `13/15` 렌더링
- 오진/교훈:
  - 2026 프로그램 seed 평가일이 로컬 테스트 일자보다 미래라 `evaluated_at` 기준 최신 정렬만 쓰면 새 제출 평가가 최신 카드에 보이지 않았다.
  - 운영에서는 실제 평가 시각과 DB 생성 시각의 의미를 분리해야 하며, 화면의 최신 제출 판단은 저장 이벤트 기준인 `created_at`을 우선해야 한다.

### Postgres admin audit/access log read path

- 목적: 1차 MVP 필수 관리자 화면인 감사 로그와 접속 로그를 private PostgreSQL read path로 전환
- 산출물:
  - private PostgreSQL schema에 `audit_logs`, `access_logs` table, index, comments 추가
  - private PostgreSQL seed에 기존 mock 화면과 동일한 감사 이벤트 2건, 접속 이벤트 2건 추가
  - app runtime grant SQL에 audit/access log select 및 향후 server-side insert/update 권한 추가
  - `postgresAdminRepository`에서 `listAuditLogs`, `listAccessLogs`를 Postgres read로 구현
  - `/admin/audit-logs`, `/admin/access-logs` 화면을 repository 기반 async page로 전환
- 설계 판단:
  - 모든 server action에 audit write를 한 번에 붙이면 범위가 커지므로, 이번 단계는 저장소와 관리자 조회 경로를 먼저 안정화한다.
  - `actor_id`는 full auth cutover 전까지 text로 두어 mock alias, Keycloak subject, 내부 user id를 모두 수용한다.
  - 보존 기간과 상세 개인정보 항목은 운영/보안 정책 확정 후 별도 migration으로 다룬다.
- 검증:
  - `npm run typecheck`, `npm run lint` 통과
  - local Postgres container에 schema/seed/grant SQL 적용 성공
  - DB count 확인: `audit_logs=2`, `access_logs=2`
  - `/admin/audit-logs?role=admin`에서 감사 이벤트 2건 렌더링 확인
  - `/admin/access-logs?role=admin`에서 접속 이벤트 2건 렌더링 확인
- 다음:
  - mutation server action별 audit write helper 연결
  - login/logout/role switch/session refresh의 access log 기록 정책 확정

### Postgres audit write helper

- 목적: Postgres-backed server action mutation이 실제 `audit_logs` row를 생성하도록 연결
- 산출물:
  - repository contract에 `AuditWriteContext`, `AuditLogDraft`, `AdminRepository.createAuditLog` 추가
  - mock repository에 `createAuditLog` fallback 추가
  - Postgres repository에 `createPostgresAuditLog` helper 추가
  - 학습피스 상태 변경, 산출물 제출, 산출물 피드백 작성, 산출물 평가 제출 mutation에 audit context 연결
  - 위 Postgres mutation은 domain write와 audit insert를 같은 transaction으로 처리하도록 보강
  - 관련 server action이 `session.user.id`, `session.user.name`, role/source metadata를 audit context로 전달
- 검증:
  - `npm run typecheck`, `npm run lint`, `npm run build` 통과
  - `docker build --progress plain --build-arg NODE_IMAGE=ps-track-dashboard:local -t ps-track-dashboard:local .` 통과
  - `REPOSITORY_PROVIDER=postgres`, `AUTH_PROVIDER=mock`, `LMS_PROVIDER=mock-view` 앱 컨테이너 재기동 후 `/api/health` 정상
  - 산출물 제출 action 호출 후 redirect audit 값이 실제 UUID `e64e9e3f-1261-4ec3-b90c-bee345a32183`로 반환됨
  - DB `audit_logs`에서 `김서연 / 산출물 제출 / artifact-002` row 확인
  - 피드백 작성 action 호출 후 redirect audit 값이 실제 UUID `0ae50f58-92a4-45fb-bdac-5a73eb7af414`로 반환됨
  - `/admin/audit-logs?role=admin`에서 `감사 이벤트 4건`, `산출물 피드백 작성`, `artifact-001` 렌더링 확인
- 오진/교훈:
  - domain mutation과 audit insert를 별도 쿼리로 두면 audit insert 실패 시 사용자는 실패를 보지만 domain write는 남을 수 있다.
  - 감사 로그가 운영 증적이면 domain write와 audit write는 같은 transaction으로 묶는 편이 맞다.
- 남은 범위:
  - LMS mapping action은 현재 `LmsContentMappingRepository`가 `MutationResult` 계약을 쓰지 않으므로 별도 계약 정리 후 audit write를 붙인다.
  - mentoring, notice, risk/reminder는 아직 mock-backed mutation이므로 Postgres 전환 또는 별도 audit action helper가 필요하다.

### LMS mapping audit write

- 목적: LMS 콘텐츠 매핑 생성/상태 변경 server action도 실제 Postgres `audit_logs`에 기록되도록 연결
- 산출물:
  - `LmsContentMappingRepository` create/update 계약을 mutation result 형태로 확장하고 optional audit context를 추가
  - mock LMS mapping repository는 기존 동작을 유지하면서 audit-compatible result를 반환하도록 보강
  - LMS 매핑 생성/상태 변경 server action이 session user, role, source metadata를 repository에 전달
  - Postgres LMS mapping 생성/상태 변경을 domain write와 audit insert가 같은 transaction에서 처리되도록 보강
  - LMS 매핑 성공 메시지에 mapping id와 audit log id를 함께 표시
- 검증:
  - `npm run typecheck`, `npm run lint`, `npm run build` 통과
  - `docker compose build ps-track-dashboard` 통과
  - `REPOSITORY_PROVIDER=postgres`, `AUTH_PROVIDER=mock`, `LMS_PROVIDER=mock-view` 앱 컨테이너 재기동 후 `/api/health` 정상
  - LMS 매핑 상태 변경 action 호출 후 redirect audit 값이 실제 UUID `f4a515a7-9e6d-4761-8bf5-19fe8ea2c260`로 반환됨
  - DB `audit_logs`에서 `시스템 총괄 / LMS 콘텐츠 매핑 상태 변경 / lms_content_mapping` row 확인
  - `/admin/lms-content-mappings` 성공 메시지에서 `audit: f4a515a7-9e6d-4761-8bf5-19fe8ea2c260` 렌더링 확인
  - `/admin/audit-logs?role=admin`에서 `감사 이벤트 6건`, `LMS 콘텐츠 매핑 상태 변경` 렌더링 확인
- 오진/교훈:
  - Docker 컨테이너 재기동 후 기존 HTML에서 가져온 Server Action ID로 POST하면 `Failed to find Server Action` 500이 발생한다.
  - 원인은 코드/DB 문제가 아니라 배포 단위가 바뀌며 action id가 변경된 것이므로, 컨테이너 재기동 후에는 반드시 새 페이지에서 action id를 다시 수집해야 한다.
- 남은 범위:
  - mentoring, notice, risk/reminder 등 아직 mock-backed mutation의 Postgres ownership 또는 별도 audit write 정책 정리
  - login/logout/role switch/session refresh access log write 정책 확정

### Session access log write helper

- 목적: `access_logs`를 조회 전용에서 실제 세션 확인 이벤트를 남기는 MVP 운영 증적으로 확장
- 산출물:
  - repository contract에 `AccessLogDraft`, `AdminRepository.createAccessLog` 추가
  - mock repository에 access log write fallback 추가
  - Postgres repository에 `createPostgresAccessLog` helper와 `createAccessLog` 구현 추가
  - `sessionProvider.requireSession()` 성공 시 `세션 확인` 또는 `역할 선택` access log를 best-effort로 기록
  - access log metadata에 auth source, requested role, active assignment id를 저장
  - 접속 로그 화면의 기록 범위 문구를 `로그인 / 세션 / 역할`로 조정
- 설계 판단:
  - MVP에서는 모든 페이지 렌더링을 기록하지 않고, server action처럼 실제 조치 직전에 `requireSession()`이 호출되는 경로부터 기록한다.
  - 접속 로그 저장 실패가 도메인 조치를 막지 않도록 best-effort로 처리한다. 감사 로그는 domain mutation과 transaction으로 묶지만, access log는 세션 관측 로그 성격이 더 강하기 때문이다.
  - 실제 Keycloak/AlphaCampus gateway 적용 이후에는 login/logout, SSO session refresh, gateway request id, client IP 신뢰 경계를 별도 정책으로 확정해야 한다.
- 검증:
  - `npm run typecheck`, `npm run lint`, `npm run build` 통과
  - `docker compose build ps-track-dashboard` 통과
  - `REPOSITORY_PROVIDER=postgres`, `AUTH_PROVIDER=mock`, `LMS_PROVIDER=mock-view` 앱 컨테이너 재기동 후 `/api/health` 정상
  - LMS 매핑 상태 변경 action 호출 전 `access_logs=2`, 호출 후 `access_logs=3` 확인
  - DB 최신 access log row 확인: `시스템 총괄 / 세션 확인 / admin / system:system`
  - `/admin/access-logs?role=admin`에서 `접속 이벤트 3건`, `세션 확인`, `로그인 / 세션 / 역할` 렌더링 확인
- 오진/교훈:
  - curl 기반 Server Action smoke에서는 브라우저 origin header가 없어 Next가 warning을 남긴다. 요청은 정상 처리되지만, 실제 브라우저 검증과 구분해 해석해야 한다.
- 남은 범위:
  - Keycloak gateway 실연동 후 실제 login/logout/session refresh 이벤트 정의
  - client IP/user-agent 신뢰 기준과 보존/마스킹 정책 확정

### Mentoring session Postgres repository and audit write

- 목적: 멘토링 기록 화면과 저장 action을 mock ownership에서 Postgres repository ownership으로 전환하고, 저장 이력을 감사 로그로 남김
- 산출물:
  - private PostgreSQL schema에 `mentoring_sessions` table, index, updated_at trigger 추가
  - seed/grant SQL에 MVP 멘토링 세션 2건과 runtime read/write 권한 추가
  - repository contract의 `updateMentoringSessionRecord`에 optional audit context 추가
  - Postgres operations repository에 멘토링 목록/상세 조회와 기록 저장 transaction 구현
  - 멘토링 목록/상세 화면이 `repositories.operations`를 통해 데이터를 읽도록 전환
  - 멘토링 기록 저장 server action이 session user와 role/source metadata를 audit context로 전달
  - 멘토링 저장 성공 시 실제 `audit_logs`에 `멘토링 기록 저장` 이벤트 생성
- 검증:
  - `npm run typecheck`, `npm run lint`, `npm run build` 통과
  - `docker compose build ps-track-dashboard` 통과
  - private PostgreSQL schema/seed/grant SQL 재적용 성공
  - `REPOSITORY_PROVIDER=postgres`, `AUTH_PROVIDER=mock`, `LMS_PROVIDER=mock-view` 앱 컨테이너 재기동 후 `/api/health` 정상
  - DB에서 `mentoring_sessions=2` 확인
  - `/mentoring/sessions?role=admin`에서 Postgres 멘토링 목록 2건 렌더링 확인
  - `/mentoring/sessions/mentoring-001?role=admin`에서 `김서연 멘토링`, `김서연`, `이멘토` 렌더링 확인
  - 멘토링 기록 저장 action 호출 후 redirect audit 값이 실제 UUID `b5017253-9740-4d63-a850-85ef13deaefe`로 반환됨
  - DB `audit_logs`에서 `시스템 총괄 / 멘토링 기록 저장 / mentoring_session / mentoring-001` row 확인
  - `/admin/audit-logs?role=admin`에서 `멘토링 기록 저장` 렌더링 확인
- 오진/교훈:
  - seed SQL의 CTE는 statement 단위로만 유효하다. `cohort_row` CTE를 뒤 insert에서 재사용해 `relation "cohort_row" does not exist`가 발생했고, lateral subquery로 cohort id를 다시 조회하도록 수정했다.
  - Postgres auth/session 전환 전에는 seed의 domain alias id(`student-001`, `mentor-001`)와 Postgres user UUID가 섞일 수 있다. 화면 표시에서는 repository 우선 조회 후 MVP alias fallback을 둬 전환기 UI 품질을 유지한다.
- 남은 범위:
  - notices, risk/reminder 등 남은 mock-backed mutation의 Postgres ownership 또는 audit write 정책 정리
  - Keycloak gateway 실연동 후 실제 user UUID 기반으로 멘토링 target/mentor FK 정책 정리

## 열린 판단

- `DOCS/`와 `docs/`가 동시에 존재하므로, 문서 폴더 표준화가 필요하다.
- 현재 구현은 mock 기반 MVP이며, 실제 운영 제품화를 위해 Auth, DB, 저장, 업로드, 이벤트 로그 자동 기록, 배포가 필요하다.
- UI 디자인 고도화는 후순위로 두고, 우선 구조와 기능 경계를 안정화한다.
