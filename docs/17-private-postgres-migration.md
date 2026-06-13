# Private PostgreSQL Migration Plan

이 문서는 PS Track MVP를 최종 운영 목적지인 독립 private PostgreSQL로 옮기기 위한 1차 migration 형태를 정리한다.

## Position

- Supabase는 validation track이다.
- private PostgreSQL은 최종 운영 target이다.
- AlphaCampus/Keycloak 인증은 `users.external_subject`로 연결한다. 운영 기본값은 Keycloak/LMS member `uuid`다.
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
psql "$DATABASE_URL" -v app_role=ps_track_app_runtime -f db/private-postgres/grants/001_app_runtime_user.sql
```

If host `psql` is unavailable, use the local Docker PostgreSQL profile:

```bash
docker compose --profile postgres up -d postgres
docker compose cp db/private-postgres/schema/001_core_auth_scope.sql postgres:/tmp/001_core_auth_scope.sql
docker compose cp db/private-postgres/seed/001_core_auth_scope_seed.sql postgres:/tmp/001_core_auth_scope_seed.sql
docker compose cp db/private-postgres/grants/001_app_runtime_user.sql postgres:/tmp/001_app_runtime_user.sql
docker compose exec -T postgres psql -U ps_track_app -d ps_track -f /tmp/001_core_auth_scope.sql
docker compose exec -T postgres psql -U ps_track_app -d ps_track -f /tmp/001_core_auth_scope_seed.sql
docker compose exec -T postgres psql -U ps_track_app -d ps_track -v app_role=ps_track_app -f /tmp/001_app_runtime_user.sql
```

App-container smoke command after the PostgreSQL profile is healthy:

```bash
REPOSITORY_PROVIDER=postgres AUTH_PROVIDER=mock docker compose --profile postgres up --build ps-track-dashboard
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

Additional retry on 2026-06-12:

- private PostgreSQL schema and seed re-applied successfully after adding `learning_piece_statuses`.
- verified `learning_piece_statuses=5`, synthetic student subject, and active LMS mappings for `lp-001`/`lp-003`.
- existing app container responded on `/api/health` with `repositoryProvider=postgres`.
- latest app image rebuild was blocked at Docker frontend image resolution: `docker-image://docker.io/docker/dockerfile:1`.
- because the running app image was stale, LMS completion apply action E2E against the latest code remains pending.

Final retry on 2026-06-12:

- Dockerfile frontend registry dependency was removed, and `NODE_IMAGE` build arg now allows local/offline verification with a preloaded image.
- `docker-compose.yml` now forwards `LMS_PROVIDER` to the app container.
- `/api/health` now reports `lmsProvider` in addition to auth/repository providers.
- `docker build --progress plain --build-arg NODE_IMAGE=ps-track-dashboard:local -t ps-track-dashboard:local .` completed successfully.
- app container ran with `AUTH_PROVIDER=mock`, `REPOSITORY_PROVIDER=postgres`, `LMS_PROVIDER=mock-view`.
- `/api/health` returned `lmsProvider=mock-view`.
- student journey detail rendered `LMS 완료 2개` and the LMS completion apply button for `lp-003`.
- browser E2E clicked `완료 반영`; Postgres confirmed `learning_piece_statuses.lp-003` changed from `in_progress` to `completed`.
- diagnostic correction: the missing LMS overlay was caused by `LMS_PROVIDER` not being passed into the container, not by the LMS overlay query itself.

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

Confirmed Keycloak context:

- Keycloak `v26.0.4` on JDK 17
- production realm `kird`
- default claims include LMS member `uuid`, `email`, `username/login_id`
- JWT verification happens at the AlphaCampus/LMS gateway
- PS Track keeps role + scope authorization in `role_assignments`

Operational mapping policy:

- `users.external_subject`: Keycloak/LMS member `uuid`
- `users.email`: Keycloak/LMS email claim
- username/login_id: diagnostic and synchronization helper, not the primary FK

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
| `KEYCLOAK_USERNAME_HEADER` | diagnostic username/login id header name |
| `KEYCLOAK_EMAIL_HEADER` | diagnostic email header name |
| `KEYCLOAK_CLIENT_ID` | diagnostic client id display value; no secret |
| `KEYCLOAK_POST_LOGOUT_REDIRECT_PATH` | local path used after Keycloak logout returns to PS Track |

## Query Helper Direction

1차 private PostgreSQL adapter는 `pg` 기반의 명시적 SQL helper를 사용한다.

- 한국 공공/ SI 유지보수 맥락에서 SQL이 직접 보이는 방식이 이해와 인수인계에 유리하다.
- ORM 스키마 DSL보다 기존 PostgreSQL migration SQL과 사고방식이 더 가깝다.
- 나중에 Spring Boot/MyBatis로 옮기더라도 repository SQL을 비교적 쉽게 재사용하거나 변환할 수 있다.
- 복잡한 query builder는 domain table migration이 충분히 쌓인 뒤 필요성을 다시 판단한다.

현재 구현 범위는 `users`, `role_assignments`, `cohorts`, `lms_content_mappings`, `learning_piece_statuses`, `modules`, `contents`, `learning_pieces`, `artifacts`, `submissions`, `feedback`, `learning_outcomes`, `rubrics`, `rubric_items`, `evaluations`, `evaluation_item_scores`, `outcome_evidence`, `mentoring_sessions`, `risk_signals`, `reminder_candidates`, `notices`, `audit_logs`, `access_logs` repository다.

`learning_piece_statuses`는 Postgres가 소유하고, `modules`, `contents`, `learning_pieces` 정의도 Postgres read path로 전환했다. 아직 cohort/template cloning ownership은 별도 table로 분리하지 않았고, 첫 전환에서는 기존 mock id(`module-001`, `content-003`, `lp-003`)를 유지하는 text primary key를 사용한다.

Domain object table expansion on 2026-06-12:

- added `modules`, `contents`, `learning_pieces` tables to private PostgreSQL schema.
- seeded MVP domain object definitions: 3 modules, 5 contents, 5 learning pieces.
- `postgresLearningRepository` now reads module/content/learning piece definitions from Postgres.
- `/objects/learning-pieces` and `/objects/learning-pieces/[learningPieceId]` render through repository reads under `REPOSITORY_PROVIDER=postgres`.
- diagnostic correction: status rows returned from Postgres contain DB UUID `studentId`, so UI code must not re-compare those rows against mock alias `student-001` after repository-level filtering.

Artifact table expansion on 2026-06-12:

- added `artifacts`, `submissions`, `feedback` tables to private PostgreSQL schema.
- seeded MVP artifact rows for one student profile, one student literature log, and one team research plan.
- `postgresArtifactRepository` now reads artifact list/detail and writes submissions/feedback through Postgres.
- `/artifacts`, `/artifacts/[artifactId]`, and `/artifacts/[artifactId]/review` render through repository reads under `REPOSITORY_PROVIDER=postgres`.
- local MVP still keeps artifact `owner_id`, feedback `author_id`, and submission `submitted_by` as stable text aliases so mock-auth screens can operate before full Keycloak/Postgres session cutover.

Evaluation/outcome table expansion on 2026-06-12:

- added `learning_outcomes`, `rubrics`, `rubric_items`, `evaluations`, `evaluation_item_scores`, `outcome_evidence` tables to private PostgreSQL schema.
- seeded MVP learning outcome, rubric, evaluation, score, and evidence rows.
- app runtime grant SQL now allows evaluation/outcome reads and evaluation/evidence writes needed by the MVP evaluation submission action.
- `postgresEvaluationRepository` now reads learning outcomes, rubrics, rubric items, evaluations, item scores, outcome evidence, and score summaries from Postgres.
- `/artifacts/[artifactId]/evaluation`, `/outcomes`, and `/outcomes/[outcomeId]` render through repository reads under `REPOSITORY_PROVIDER=postgres`.
- evaluation submission writes evaluation, item scores, and generated outcome evidence in a single Postgres transaction.
- diagnostic correction: seed evaluation dates can be later than local test dates, so latest evaluation display must sort by DB `created_at` before evaluated date.

Audit/access log table expansion on 2026-06-12:

- added `audit_logs` and `access_logs` tables to private PostgreSQL schema.
- seeded MVP audit and access events that match the existing admin log screens.
- app runtime grant SQL now allows audit/access log read and future server-side inserts.
- `postgresAdminRepository` now reads audit/access log lists from Postgres while retaining mock fallback for other admin repository methods.
- `/admin/audit-logs` and `/admin/access-logs` render through repository reads under `REPOSITORY_PROVIDER=postgres`.
- audit write helper now records selected Postgres-backed mutations in `audit_logs`: LMS completion apply, artifact submission, artifact feedback, artifact evaluation, LMS content mapping create, and LMS content mapping status update.
- write path currently keeps audit insert in the same transaction as the domain mutation for those Postgres-backed methods.
- access log write helper now records successful `sessionProvider.requireSession()` resolutions for server-action paths as `세션 확인` or `역할 선택` events.
- access log writes are best-effort in MVP so domain actions are not blocked by access log storage outages.
- remaining audit write expansion: none for the current MVP write actions.
- remaining access log expansion: real Keycloak gateway login/logout/session refresh policy, trusted client IP handling, and retention/masking policy.
- diagnostic correction: after a Docker container rebuild/recreate, Next Server Action IDs must be collected from the freshly rendered page before POST smoke tests. Reusing an older action ID produces `Failed to find Server Action` 500 even when the implementation is healthy.
- diagnostic note: curl-based Server Action smoke tests may emit a Next warning about a missing `origin` header. The warning is expected for non-browser smoke requests when the action succeeds.

Mentoring session table expansion on 2026-06-13:

- added `mentoring_sessions` table to private PostgreSQL schema with cohort, target, mentor, schedule, status, external meeting URL, notes, linked artifact, and next action fields.
- seeded MVP mentoring session rows for one student target and one team target.
- app runtime grant SQL now allows mentoring session reads and updates.
- `postgresOperationsRepository` now reads mentoring session list/detail and writes mentoring record updates through Postgres.
- `/mentoring/sessions` and `/mentoring/sessions/[sessionId]` render through repository reads under `REPOSITORY_PROVIDER=postgres`.
- mentoring record updates write domain changes and `audit_logs` rows in a single Postgres transaction.
- transition note: MVP seed rows still use stable text aliases such as `student-001`, `team-001`, and `mentor-001`; full Keycloak/Postgres cutover should replace or formally map these aliases to LMS/Keycloak UUIDs.
- diagnostic correction: SQL CTEs are scoped per statement, so seed inserts that need the cohort id after the first insert must query the cohort row again instead of reusing an earlier CTE.

Risk/reminder table expansion on 2026-06-13:

- added `risk_signals` and `reminder_candidates` tables to private PostgreSQL schema with target, related object, status, channel, and recommendation fields.
- seeded MVP risk rows for artifact missing, mentoring issue, and learning piece delay signals.
- seeded MVP reminder rows for email, manual, and kakao reminder candidates.
- app runtime grant SQL now allows risk/reminder reads and updates.
- `postgresOperationsRepository` now reads risk/reminder lists and writes status updates through Postgres.
- `/operations/risks` renders through repository reads under `REPOSITORY_PROVIDER=postgres`.
- risk action status updates and reminder send status updates write domain changes and `audit_logs` rows in a single Postgres transaction.
- transition note: reminder sending remains an external/manual operation in MVP; PS Track currently owns the operational status record, not the delivery integration.

Notice table expansion on 2026-06-13:

- added `notices` table to private PostgreSQL schema with cohort, title, body, target scope, published time, creator, and read count fields.
- seeded MVP notice rows for cohort guidance and team mentoring link guidance.
- app runtime grant SQL now allows notice reads and inserts.
- `postgresAdminRepository` now reads notice lists and creates notices through Postgres.
- `/notices` and `/notices/new` use repository reads/writes under `REPOSITORY_PROVIDER=postgres`.
- notice creation writes the notice row and `audit_logs` row in a single Postgres transaction.
- transition note: notices remain separate from learning content objects by IA decision, so communication records do not pollute journey object data.

## Next Implementation Step

1. Keycloak gateway 실연동 후 login, logout, session refresh access log policy 확정
2. LMS readonly catalog view 명세 수령 후 `LMS_PROVIDER=readonly-db` adapter 추가
3. 공지 읽음 사용자별 로그, 수정/비공개 정책, 실제 발송 채널 연동은 MVP 이후 판단
