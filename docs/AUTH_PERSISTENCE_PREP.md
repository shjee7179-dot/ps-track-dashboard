# Auth / Session / Persistence Prep

이 문서는 mock 기반 MVP에서 실제 Auth/session과 persistence로 넘어가기 전 준비 기준을 기록한다.

## 현재 상태

- 세션은 `src/lib/session.ts`의 mock helper와 `?role=` query로 선택된다.
- 권한은 `src/lib/permissions.ts`에서 `role + scope` 기준으로 판단한다.
- 화면과 helper는 대부분 `src/lib/mock-data.ts`를 직접 읽는다.
- `domain.ts`는 기존 import 호환을 위한 re-export layer에 가까워지고 있다.

## 전환 원칙

1. 화면을 먼저 바꾸지 않는다.
2. mock helper와 실제 repository가 같은 contract를 만족하도록 만든다.
3. 읽기 경로를 repository로 먼저 옮긴 뒤, mutation/server action을 붙인다.
4. 모든 mutation은 session, permission, write, audit log 순서로 처리한다.
5. Supabase/Postgres 전환 전에도 타입과 contract는 앱 코드에 남겨둔다.

## 추가된 준비 코드

| 파일 | 목적 |
| --- | --- |
| `src/lib/session-contract.ts` | 실제 session provider가 만족해야 하는 `AppSession`, `SessionProvider`, access target/decision 정의 |
| `src/lib/repository-contracts.ts` | mock data와 DB repository가 공유할 읽기/쓰기 contract 정의 |
| `src/lib/mock-repositories.ts` | persistence 전환 전 화면/서버 액션이 먼저 의존할 mock repository implementation |
| `src/lib/session.ts` | 기존 mock session helper에 `mockSessionProvider`를 추가해 `SessionProvider` contract 충족 |
| `.env.example` | Vercel/Supabase 전환 시 필요한 환경변수 계약 |
| `src/lib/supabase/` | Supabase Auth, Postgres, Storage adapter를 둘 future implementation 자리 |
| `docs/SUPABASE_TRANSITION_PLAN.md` | Supabase/Auth/DB 전환 순서와 운영 판단 기준 |
| `db/schema/001_core_auth_scope.sql` | Auth/session 전환 전 users, role assignments, cohorts, teams 실제 테이블 모양 초안 |
| `src/lib/supabase/env.ts` | Supabase public/admin 환경변수 validation helper |
| `src/lib/supabase/clients.ts` | browser Supabase client factory |
| `src/lib/supabase/server.ts` | server/admin Supabase client factory, service role server-only 경계 |
| `src/lib/supabase/database.ts` | generated DB type 도입 전 placeholder |
| `src/lib/supabase/session-provider.ts` | Supabase Auth user와 role assignments를 `AppSession`으로 조립하는 provider 초안 |

## Session Contract

실제 session provider는 최소 다음 정보를 제공해야 한다.

- user
- activeRole
- activeAssignment
- assignments
- source

권한 판단은 다음 대상 구조를 받아야 한다.

- scopeType
- scopeId
- action

## Repository 전환 순서

| 순서 | 영역 | 이유 |
| --- | --- | --- |
| 1 | users / role assignments | Auth/session의 기준 데이터 |
| 2 | learning journey | 학생 개인 기준 핵심 축 |
| 3 | artifacts / submissions / feedback | 저장 기능의 첫 실제 운영 가치 |
| 4 | evaluations / outcomes | 산출물 평가 이후 성과 집계 |
| 5 | mentoring / risks | 운영자 조치 흐름 |
| 6 | logs / settings / notices | 관리자 기능과 감사 추적 |

## 첫 Mutation 후보

| 후보 | 우선순위 | 이유 |
| --- | --- | --- |
| 학습피스 상태 변경 | P0 | 학생 여정의 실제 완료 기준 |
| 산출물 제출 생성 | P0 | 파일/링크 제출과 버전 관리의 시작점 |
| 피드백 생성 | P0 | 멘토링/리뷰 흐름의 실제 운영 가치 |
| 평가 제출 | P1 | 산출물 평가와 성과 집계 연결 |
| 리스크 조치 상태 변경 | P1 | 운영자 액션 관리 |

## Server Action Guard 초안

모든 server action은 다음 순서로 구현한다.

```text
1. requireSession()
2. resolve target scope
3. canAccess(session, target)
4. validate input
5. write through repository
6. create audit/activity log
7. revalidate affected paths
```

## Supabase 전환 시 확인할 것

- `users.id`를 앱 도메인 id로 유지할지, Supabase `auth.users.id`와 맞출지 최종 결정한다.
- 현재 권장안은 `users.id`와 `users.auth_user_id`를 분리하는 방식이다.
- 첫 SQL 초안은 `db/schema/001_core_auth_scope.sql`에 두며, `users.id`는 앱 도메인 id, `users.auth_user_id`는 Supabase Auth 연결값으로 분리한다.
- role assignment는 active row 기준으로 조회한다.
- `role_assignments.scope_id`는 polymorphic scope를 수용하기 위해 text로 둔다.
- RLS는 최소 read/write action과 scope 단위로 나눈다.
- Storage는 artifacts/submissions와 먼저 연결한다.
- audit log는 server action에서 우선 기록하고, DB trigger는 후속 고도화로 둔다.

## Supabase adapter 준비 상태

- `@supabase/supabase-js`, `@supabase/ssr`를 설치했다.
- `src/lib/supabase/contracts.ts`는 adapter가 만족해야 할 contract와 전환 순서를 기록한다.
- `src/lib/supabase/clients.ts`는 browser client만 생성한다.
- `src/lib/supabase/server.ts`는 `server-only` 경계 안에서 request cookie 기반 server client와 service role admin client를 생성한다.
- `src/lib/supabase/session-provider.ts`는 `supabase.auth.getUser()`로 검증된 Auth user를 읽고, `users.auth_user_id`와 `role_assignments`를 통해 `AppSession`을 만든다.
- `src/lib/session-provider.ts`는 `AUTH_PROVIDER=mock|supabase` 값에 따라 session provider를 선택한다.
- `AUTH_PROVIDER` 기본값은 `mock`이며, `REPOSITORY_PROVIDER=mock`은 아직 유지한다.
- `SUPABASE_SERVICE_ROLE_KEY`는 server-only 영역에서만 사용한다.

## Audit notes

- `npm audit --json` 기준 moderate 2건이 보고된다.
- 실제 advisory는 `postcss < 8.5.10`의 CSS stringify XSS 이슈(`GHSA-qx2v-qp2m-jg93`)다.
- 현재 프로젝트에서는 `next@16.2.6` 내부 의존성인 `node_modules/next/node_modules/postcss`를 통해 보고된다.
- npm은 direct package `next`도 affected로 함께 보고하지만, `npm audit fix --force`가 제안하는 자동 수정은 Next 버전을 크게 흔들 수 있어 이번 PR에서는 적용하지 않는다.
- 보완은 Next가 해당 PostCSS 의존성을 올린 안정 패치 버전으로 업데이트 가능한 시점에 별도 PR로 처리한다.

## 다음 PR 제안

1. DB-backed users / role assignments repository 구현
2. core schema seed/RLS 초안 작성
3. Storage 연결 설계

## Mock completion reference

- 남은 mock action과 repository 전환 상태는 `docs/MOCK_COMPLETION_NOTES.md`에 별도 정리한다.
