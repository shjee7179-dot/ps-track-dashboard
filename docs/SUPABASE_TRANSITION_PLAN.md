# Supabase Validation Track

이 문서는 mock 기반 MVP에서 PostgreSQL/Auth adapter 경계를 검증하기 위한 Supabase validation track이다. 최종 운영 목적지는 `docs/15-alphacampus-msa-boundary.md`의 AlphaCampus 인증 연동 독립 MSA이며, Supabase는 최종 운영 인프라가 아니다.

## 결론

- 최종 운영안은 AlphaCampus/Keycloak 인증 + 독립 private PostgreSQL + container 기반 MSA다.
- Supabase Auth/Postgres 코드는 최종 운영 스택이 아니라 빠른 검증용 adapter 구현으로 유지한다.
- LMS/DB 깊은 통합은 `docs/13-lms-db-integration-proposal.md`의 Future Integration Track으로 유지하되, 인증/최소 조회 경계는 `docs/15-alphacampus-msa-boundary.md`를 우선한다.
- 화면은 `AppRepositories`와 `SessionProvider` contract를 계속 바라본다.
- 실제 운영 전환 시 `supabase` provider는 `keycloak` / `postgres` provider로 대체 가능해야 한다.

## 왜 Supabase validation인가

이 시스템은 단순 로그인 앱보다 관계형 운영 데이터가 중요하다.

- 학생, 팀, 멘토, 운영자, PI, 관리자
- role + scope 권한
- 학습피스 상태
- 산출물 제출 버전
- 피드백과 멘토링 기록
- 루브릭 평가와 학습성과 evidence
- 감사 로그와 접속 로그

Firebase보다 PostgreSQL 기반 검증이 더 유효하다. 특히 `role_assignments`, `learning_piece_statuses`, `artifacts`, `evaluations`, `outcome_evidence`는 관계형 조인과 트랜잭션의 이점이 크다. Supabase는 이 PostgreSQL 구조를 빠르게 검증하기 위한 선택지이며, 최종 운영에서는 private PostgreSQL로 옮길 수 있어야 한다.

## 전환 단계

### Phase 0: 현재 상태

- Mock data 기반 MVP
- `mockSessionProvider`가 `SessionProvider` contract를 만족
- `mockRepositories`가 `AppRepositories` contract를 만족
- 주요 read path는 repository 경유로 상당 부분 전환
- Server action은 session, permission, repository, revalidate 흐름을 따르기 시작

### Phase 1: 전환 준비

- `.env.example`로 환경변수 계약 고정
- `src/lib/supabase/` 아래 adapter 자리 생성
- Supabase session provider와 DB-backed repository가 만족해야 할 contract 명시
- DB schema draft와 repository contract의 매핑표 확정
- `db/schema/001_core_auth_scope.sql`로 users, role assignments, cohorts, teams 기준 SQL 초안 고정
- `@supabase/supabase-js`, `@supabase/ssr` 설치
- browser/server/admin client factory 구현
- 실제 Auth/session provider와 DB repository 연결은 보류

### Phase 2: Auth Provider 전환

- `supabaseSessionProvider` 초안 구현
- `users.auth_user_id` 또는 `users.id` 전략 확정 후 적용
- 로그인 callback과 세션 유지 흐름 구현
- `role_assignments` 조회 기반 active assignment 결정
- `AUTH_PROVIDER=mock|supabase` provider switch 적용

### Phase 3: DB-backed Repository 전환

- 우선순위는 다음 순서로 둔다.
  1. users / role assignments: implemented as first Supabase-backed repository draft
  2. cohorts / teams
  3. learning objects / learning piece statuses
  4. artifacts / submissions / feedback
  5. evaluations / outcomes
  6. mentoring / risks / reminders
  7. notices / logs / settings

### Phase 4: Storage 검증

- 첫 단계는 external URL과 file metadata 저장
- 실제 파일 업로드는 운영 인프라가 확정된 뒤 private object storage 또는 기관 승인 저장소와 연결한다.
- `submissions.file_path`, `file_name`, `mime_type`, `file_size`를 DB에 저장
- signed URL과 접근 권한은 server side에서 발급

### Phase 5: RLS와 감사 로그 강화

- 1차는 repository/server action 권한 검사로 보호
- 이후 핵심 테이블부터 RLS를 점진 적용
- 첫 RLS 초안은 `db/policies/001_core_auth_scope_rls.sql`에 둔다.
- 첫 seed 초안은 `db/seed/001_core_auth_scope_seed.sql`에 둔다.
- Audit log는 server action에서 먼저 기록하고, DB trigger는 후속 고도화로 둔다.

## 사용자 ID 전략

권장안은 앱 도메인 `users.id`와 인증 provider id를 분리하는 방식이다.

| 컬럼 | 목적 |
| --- | --- |
| `users.id` | 앱 내부 도메인 user id |
| `users.auth_user_id` | Supabase `auth.users.id` |
| `users.external_subject` | Keycloak/LMS future integration subject |
| `users.email` | 로그인/초대/알림 식별 |

이 방식은 Supabase 독립 MVP와 향후 Keycloak/LMS 연동을 동시에 수용하기 쉽다.
SQL 초안에서는 `users.auth_user_id`를 nullable unique column으로 두어 초대/운영 등록 이후 Auth 계정 연결이 가능하게 한다.

## 권한 모델

Supabase Auth의 사용자 메타데이터만으로는 이 시스템의 권한을 표현하기 어렵다. 따라서 `role_assignments`는 핵심 도메인 테이블로 유지한다.

```text
role_assignments
- user_id
- role
- scope_type
- scope_id
- status
```

`scope_id`는 text로 둔다. `system`은 상수값이고, `program`, `cohort`, `team`, `student`는 각 대상의 id 또는 code를 참조할 수 있어서 초기에는 polymorphic foreign key 대신 application/repository layer에서 검증한다.

권한 판단은 계속 다음 순서를 따른다.

```text
1. requireSession()
2. active role assignment resolve
3. target scope resolve
4. canAccess(session, target)
5. repository read/write
6. audit/activity log
7. revalidate
```

## RLS 적용 원칙

- 처음부터 모든 테이블에 복잡한 RLS를 적용하지 않는다.
- Server action과 repository layer의 권한 검사를 먼저 안정화한다.
- RLS는 `users`, `role_assignments`, `learning_piece_statuses`, `artifacts`, `submissions`부터 점진 적용한다.
- Service role key는 서버 전용 admin 작업에서만 사용한다.

## Vercel 환경변수

Vercel에는 `.env.example`의 key를 기준으로 환경변수를 등록한다.

- Preview와 Production 값을 분리한다.
- `SUPABASE_SERVICE_ROLE_KEY`는 client bundle에 노출하지 않는다.
- `NEXT_PUBLIC_` prefix가 붙은 값만 browser에서 읽을 수 있게 둔다.

## Client Factory 경계

| factory | file | purpose |
| --- | --- | --- |
| `createSupabaseBrowserClient` | `src/lib/supabase/clients.ts` | browser runtime에서 public URL과 anon key로 client 생성 |
| `createSupabaseServerClient` | `src/lib/supabase/server.ts` | request cookies 기반 user-scoped server client 생성 |
| `createSupabaseAdminClient` | `src/lib/supabase/server.ts` | service role key 기반 server-only admin client 생성 |

페이지와 server action은 가능한 한 이 client를 직접 쓰지 않고, `SessionProvider`와 `AppRepositories` adapter를 통해 접근한다.

## Repository Provider 경계

`src/lib/repositories.ts`는 `REPOSITORY_PROVIDER`에 따라 active repository set을 선택한다.

| value | provider |
| --- | --- |
| unset/mock | `mockRepositories` |
| supabase | `supabaseRepositories` |

현재 `supabaseRepositories`는 `users` domain만 DB-backed로 제공하고, 나머지 domain은 mock fallback을 사용한다. 이 방식은 앱 전체를 한 번에 DB로 전환하지 않고, `users` / `role_assignments`부터 실제 테이블 검증을 시작하기 위한 중간 단계다.

## Seed / RLS 적용 순서 초안

```text
1. db/schema/001_core_auth_scope.sql
2. db/seed/001_core_auth_scope_seed.sql
3. Supabase Auth 계정 생성 또는 초대
4. users.auth_user_id 연결
5. db/policies/001_core_auth_scope_rls.sql
6. AUTH_PROVIDER=supabase / REPOSITORY_PROVIDER=supabase preview 검증
7. 운영 전환 시 AUTH_PROVIDER=keycloak / REPOSITORY_PROVIDER=postgres로 대체
```

RLS는 우선 read policy 중심이다. create/update/delete는 server action guard와 audit log가 실제 DB write path에 붙은 뒤 별도 policy로 확장한다.

## Session Provider 경계

`src/lib/session-provider.ts`는 `AUTH_PROVIDER`에 따라 active session provider를 선택한다.

| value | provider |
| --- | --- |
| unset/mock | `mockSessionProvider` |
| supabase | `supabaseSessionProvider` |

`supabaseSessionProvider`는 다음 흐름을 따른다.

```text
1. createSupabaseServerClient()
2. supabase.auth.getUser()
3. users.auth_user_id = auth.users.id 로 app user 조회
4. role_assignments.user_id = users.id 로 assignment 조회
5. roleParam/defaultRole/first active 순서로 active assignment 선택
6. AppSession 반환
```

기본값은 여전히 mock이다. Supabase provider는 환경변수를 명시적으로 `AUTH_PROVIDER=supabase`로 바꿨을 때만 사용한다. 최종 운영 provider는 `keycloak`으로 확장한다.

## Future Integration Track과의 경계

`docs/13-lms-db-integration-proposal.md`는 지금 본선에 섞지 않는다.

- AlphaCampus/Keycloak 인증 연동은 최종 운영 목적지로 두되, 깊은 LMS DB 통합은 별도 branch 또는 후속 버전
- 본선은 인증 subject와 최소 사용자/참여 자격 조회만 연동
- 단, `users.external_subject`와 learning piece의 LMS mapping column은 future-compatible하게 설계 가능

## 다음 PR 후보

1. Container 실행 가능성 확보
2. AlphaCampus/Keycloak provider 설계
3. private PostgreSQL migration 형태 정리
