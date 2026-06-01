# Container Deployment

이 문서는 PS Track 대시보드를 독립 MSA container로 실행하기 위한 1차 기준을 기록한다.

## Position

- 최종 목적지는 AlphaCampus 인증 연동 + 독립 PostgreSQL + container 기반 MSA다.
- 현재 container는 mock provider 기본값으로 실행 가능해야 한다.
- PostgreSQL/Keycloak 연결은 후속 provider 작업에서 붙인다.

## Files

| file | purpose |
| --- | --- |
| `Dockerfile` | Next.js standalone production image build |
| `.dockerignore` | build context 최소화 |
| `docker-compose.yml` | local container smoke run |
| `src/app/api/health/route.ts` | container health check endpoint |

## Runtime Defaults

| env | default | note |
| --- | --- | --- |
| `AUTH_PROVIDER` | `mock` | future: `keycloak` |
| `REPOSITORY_PROVIDER` | `mock` | future: `postgres` |
| `PORT` | `3000` | container listener |
| `HOSTNAME` | `0.0.0.0` | required for container access |
| `KEYCLOAK_SUB_HEADER` | `x-keycloak-sub` | used when `AUTH_PROVIDER=keycloak` |
| `KEYCLOAK_USERNAME_HEADER` | `x-keycloak-preferred-username` | diagnostic identity header |
| `KEYCLOAK_EMAIL_HEADER` | `x-keycloak-email` | diagnostic identity header |
| `DATABASE_URL` | empty in production image | future private PostgreSQL connection string |

## Local Commands

```bash
docker build -t ps-track-dashboard:local .
docker run --rm -p 3000:3000 ps-track-dashboard:local
```

or:

```bash
docker compose up --build
```

Optional local PostgreSQL profile:

```bash
docker compose --profile postgres up postgres
psql "$DATABASE_URL" -f db/private-postgres/schema/001_core_auth_scope.sql
psql "$DATABASE_URL" -f db/private-postgres/seed/001_core_auth_scope_seed.sql
```

Health check:

```bash
curl http://localhost:3000/api/health
```

## Verification Status

- `npm run build` creates `.next/standalone`.
- Running `.next/standalone/server.js` with mock providers responds on `/api/health`.
- Docker CLI is installed locally, but image build was not completed in this session because the Docker daemon socket was unavailable.
- Re-run `docker build -t ps-track-dashboard:local .` after Docker Desktop or the target container runtime is fully running.

## Operating Notes

- The image uses Next.js `output: "standalone"`.
- The first container target does not require Supabase, PostgreSQL, or Keycloak.
- The local `postgres` compose service is optional and is not started unless `--profile postgres` is used.
- Public runtime config should be provided as environment variables.
- Secrets must be injected by the deployment platform and never baked into the image.
- NHN Cloud public deployment should place database access on a private network path.

## Follow-Up

1. Add private PostgreSQL runtime profile.
2. Add production-grade Keycloak token/header verification at the gateway or WAS boundary.
3. Add structured application logs for container operation.
4. Add OpenAPI/API contract for AlphaCampus integration boundary.
