# Private PostgreSQL Policy Notes

Supabase validation track의 `db/policies/001_core_auth_scope_rls.sql`는 `auth.uid()`와 Supabase `authenticated` role에 의존한다.

private PostgreSQL 운영 profile에서는 그 정책을 그대로 적용하지 않는다.

## 1차 운영 원칙

- DB는 public internet에 노출하지 않는다.
- app runtime DB user는 WAS container에서만 사용한다.
- page/server action은 `SessionProvider`와 `role_assignments` 기반 permission guard를 거친다.
- write path는 audit log 기록이 붙은 server action으로 제한한다.
- DB migration owner와 app runtime user를 분리한다.

## 후속 보강

- app runtime user용 최소 권한 grant SQL
- audit/access log table과 retention policy
- PostgreSQL native RLS 적용 여부 검토
- Keycloak subject sync/import procedure
