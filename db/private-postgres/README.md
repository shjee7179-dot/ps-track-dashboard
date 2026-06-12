# Private PostgreSQL Migration Profile

이 폴더는 최종 운영 목적지인 AlphaCampus/Keycloak 인증 연동 + 독립 private PostgreSQL 환경을 위한 SQL 기준선이다.

## Position

- `db/schema`, `db/seed`, `db/policies`는 Supabase validation track으로 유지한다.
- `db/private-postgres`는 NHN Cloud 공공 환경 또는 기관 승인 private PostgreSQL에 적용할 운영 전환 초안이다.
- PS Track의 권한은 Keycloak realm/client role이 아니라 `role_assignments`로 결정한다.
- Keycloak subject 또는 AlphaCampus 사용자 식별자는 `users.external_subject`에 저장한다.

## Apply Order

```bash
psql "$DATABASE_URL" -f db/private-postgres/schema/001_core_auth_scope.sql
psql "$DATABASE_URL" -f db/private-postgres/seed/001_core_auth_scope_seed.sql
psql "$DATABASE_URL" -v app_role=ps_track_app_runtime -f db/private-postgres/grants/001_app_runtime_user.sql
```

## Security Boundary

private PostgreSQL profile은 Supabase RLS에 의존하지 않는다.

- DB는 private network에 둔다.
- WAS container만 DB에 접속한다.
- mutation은 server action과 `SessionProvider`/permission guard를 거친다.
- 감사 로그와 접속 로그는 앱 레벨에서 별도 테이블/이벤트로 확장한다.
- 운영 DB 계정은 migration owner와 app runtime user를 분리한다.

## Future Work

1. domain tables: modules, contents, learning_pieces
2. journey tables: activity_logs
3. artifact tables: artifacts, submissions, feedback
4. evaluation/outcome tables
5. audit/access log tables
6. audit/access log tables
