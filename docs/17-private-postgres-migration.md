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

If host `psql` is unavailable, use the local Docker PostgreSQL profile:

```bash
docker compose --profile postgres up -d postgres
docker compose cp db/private-postgres/schema/001_core_auth_scope.sql postgres:/tmp/001_core_auth_scope.sql
docker compose cp db/private-postgres/seed/001_core_auth_scope_seed.sql postgres:/tmp/001_core_auth_scope_seed.sql
docker compose exec -T postgres psql -U ps_track_app -d ps_track -f /tmp/001_core_auth_scope.sql
docker compose exec -T postgres psql -U ps_track_app -d ps_track -f /tmp/001_core_auth_scope_seed.sql
```

## Local Docker Verification

Verified locally after Docker Desktop daemon was running:

- PostgreSQL `postgres:16-alpine` profile started and became healthy.
- private PostgreSQL schema SQL applied successfully.
- private PostgreSQL seed SQL applied successfully.
- seed counts: `users=5`, `role_assignments=5`, `teams=1`.
- `external_subject` values map to role/scope rows for student, operator, mentor, PI, and admin.
- application image `ps-track-dashboard:local` built successfully.
- built application container responded on `/api/health` with mock providers.

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
| `POSTGRES_SSL` | enable TLS for managed/private PostgreSQL when required |
| `AUTH_PROVIDER=keycloak` | AlphaCampus/Keycloak trusted-header session |
| `REPOSITORY_PROVIDER=postgres` | future private PostgreSQL repository selector |
| `KEYCLOAK_SUB_HEADER` | Keycloak subject header name |

## Query Helper Direction

1차 private PostgreSQL adapter는 `pg` 기반의 명시적 SQL helper를 사용한다.

- 한국 공공/ SI 유지보수 맥락에서 SQL이 직접 보이는 방식이 이해와 인수인계에 유리하다.
- ORM 스키마 DSL보다 기존 PostgreSQL migration SQL과 사고방식이 더 가깝다.
- 나중에 Spring Boot/MyBatis로 옮기더라도 repository SQL을 비교적 쉽게 재사용하거나 변환할 수 있다.
- 복잡한 query builder는 domain table migration이 충분히 쌓인 뒤 필요성을 다시 판단한다.

현재 구현 범위는 `users`와 `role_assignments` repository다. 나머지 repository domain은 `mockRepositories` fallback을 유지한다.

## Next Implementation Step

1. `lms_content_mappings` repository implementation
2. domain table migration 확대
3. journey/artifact/evaluation repository를 순차적으로 postgres-backed로 전환
4. audit/access log table migration 추가
5. app runtime user grant SQL 작성
