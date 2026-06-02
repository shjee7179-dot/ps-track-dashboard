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

## 열린 판단

- `DOCS/`와 `docs/`가 동시에 존재하므로, 문서 폴더 표준화가 필요하다.
- 현재 구현은 mock 기반 MVP이며, 실제 운영 제품화를 위해 Auth, DB, 저장, 업로드, 이벤트 로그 자동 기록, 배포가 필요하다.
- UI 디자인 고도화는 후순위로 두고, 우선 구조와 기능 경계를 안정화한다.
