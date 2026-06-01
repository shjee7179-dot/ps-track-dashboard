# Supabase Auth / DB Transition Plan

이 문서는 mock 기반 MVP를 실제 운영 가능한 Supabase Auth, Postgres, Storage 구조로 전환하기 위한 준비 계획이다. 현재 PR의 목표는 실제 Supabase 연결이 아니라, 전환 경계와 환경 계약을 고정하는 것이다.

## 결론

- 기본 운영안은 Vercel + Supabase를 채택한다.
- Supabase Auth는 1차 독립 MVP 인증 수단으로 둔다.
- LMS/Keycloak/외부 DB 연동은 `docs/13-lms-db-integration-proposal.md`의 Future Integration Track으로 유지한다.
- 화면은 `AppRepositories`와 `SessionProvider` contract를 계속 바라본다.
- 실제 SDK 연결, DB migration, RLS 적용은 후속 PR에서 진행한다.

## 왜 Supabase인가

이 시스템은 단순 로그인 앱보다 관계형 운영 데이터가 중요하다.

- 학생, 팀, 멘토, 운영자, PI, 관리자
- role + scope 권한
- 학습피스 상태
- 산출물 제출 버전
- 피드백과 멘토링 기록
- 루브릭 평가와 학습성과 evidence
- 감사 로그와 접속 로그

Firebase도 가능하지만, 이 관계 모델은 Postgres 기반의 Supabase가 더 자연스럽다. 특히 `role_assignments`, `learning_piece_statuses`, `artifacts`, `evaluations`, `outcome_evidence`는 관계형 조인과 트랜잭션의 이점이 크다.

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
- 실제 SDK 설치와 연결은 보류

### Phase 2: Auth Provider 전환

- Supabase browser/server client 추가
- `supabaseSessionProvider` 구현
- `users.auth_user_id` 또는 `users.id` 전략 확정 후 적용
- 로그인 callback과 세션 유지 흐름 구현
- `role_assignments` 조회 기반 active assignment 결정

### Phase 3: DB-backed Repository 전환

- 우선순위는 다음 순서로 둔다.
  1. users / role assignments
  2. cohorts / teams
  3. learning objects / learning piece statuses
  4. artifacts / submissions / feedback
  5. evaluations / outcomes
  6. mentoring / risks / reminders
  7. notices / logs / settings

### Phase 4: Storage 전환

- 첫 단계는 external URL과 file metadata 저장
- 실제 파일 업로드는 Supabase Storage bucket 분리 후 적용
- `submissions.file_path`, `file_name`, `mime_type`, `file_size`를 DB에 저장
- signed URL과 접근 권한은 server side에서 발급

### Phase 5: RLS와 감사 로그 강화

- 1차는 repository/server action 권한 검사로 보호
- 이후 핵심 테이블부터 RLS를 점진 적용
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

## Future Integration Track과의 경계

`docs/13-lms-db-integration-proposal.md`는 지금 본선에 섞지 않는다.

- Supabase Auth MVP는 독립 로그인으로 진행
- Keycloak/LMS 연동은 별도 branch 또는 별도 버전
- 단, `users.external_subject`와 learning piece의 LMS mapping column은 future-compatible하게 설계 가능

## 다음 PR 후보

1. Supabase SDK 설치와 client factory 구현
2. `supabaseSessionProvider` 초안 구현
3. DB schema SQL 초안 작성
4. users / role assignments DB-backed repository 구현
5. submissions file metadata와 Storage bucket 설계
