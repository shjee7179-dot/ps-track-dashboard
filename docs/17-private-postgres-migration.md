# Private PostgreSQL Migration Plan

이 문서는 PS Track MVP를 최종 운영 목적지인 독립 private PostgreSQL로 옮기기 위한 1차 migration 형태를 정리한다.

## Position

- Supabase는 validation track이다.
- private PostgreSQL은 최종 운영 target이다.
- AlphaCampus/Keycloak 인증은 `users.external_subject`로 연결한다.
- PS Track 권한은 `role_assignments`가 소유한다.
- 깊은 LMS DB integration은 Future Integration Track으로 유지한다.

## Track Separation

| track | folder | purpose |
| --- | --- | --- |
| Supabase validation | `db/schema`, `db/seed`, `db/policies` | Supabase Auth/RLS 검증 |
| Private PostgreSQL target | `db/private-postgres` | 독립 PostgreSQL 운영 전환 기준선 |

## Migration Apply Order

```bash
psql "$DATABASE_URL" -f db/private-postgres/schema/001_core_auth_scope.sql
psql "$DATABASE_URL" -f db/private-postgres/seed/001_core_auth_scope_seed.sql
```

## Identity Mapping

`AUTH_PROVIDER=keycloak`은 trusted header에서 Keycloak subject를 읽고, `users.external_subject`와 매핑한다.

```text
Keycloak subject
  -> trusted header x-keycloak-sub
  -> users.external_subject
  -> users.id
  -> role_assignments
  -> AppSession
```

## Private PostgreSQL Differences From Supabase

- `users.auth_user_id`와 `auth.users` FK를 사용하지 않는다.
- Supabase `auth.uid()` 기반 RLS를 적용하지 않는다.
- 인증 검증은 AlphaCampus/Keycloak boundary에서 처리한다.
- DB는 private network에 두고 WAS container에서만 접근한다.
- authorization은 앱의 `SessionProvider`와 permission guard에서 검증한다.

## Runtime Environment

| env | purpose |
| --- | --- |
| `DATABASE_URL` | future `REPOSITORY_PROVIDER=postgres` adapter connection |
| `AUTH_PROVIDER=keycloak` | AlphaCampus/Keycloak trusted-header session |
| `REPOSITORY_PROVIDER=postgres` | future private PostgreSQL repository selector |
| `KEYCLOAK_SUB_HEADER` | Keycloak subject header name |

## Next Implementation Step

1. PostgreSQL client/query helper 선택
2. `REPOSITORY_PROVIDER=postgres` selector stub 또는 users repository 구현
3. users / role_assignments DB-backed repository를 private PostgreSQL SQL에 맞게 구현
4. domain table migration 확대
5. audit/access log table migration 추가
