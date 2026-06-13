# Local Docker Integration MVP

이 문서는 공공기관 클라우드/망 분리 배포 전에 로컬 Docker에서 운영 경계를 검증하기 위한 1차 목표를 정리한다.

## Decision

로컬 Docker에서 MVP 수준의 운영망 시뮬레이션을 1차 목표로 둔다.

단, 이것은 본선을 Docker 중심으로 전면 전환하는 결정이 아니다. 현재 화면/도메인 MVP는 유지하고, Docker 작업은 향후 공공기관 보안망 배포 리스크를 줄이는 검증 트랙으로 운영한다.

## Why This Is Reasonable

- 이미 Docker image build, PostgreSQL profile, private PostgreSQL schema/seed 적용, app health check가 로컬에서 성공했다.
- 최종 목적지는 AlphaCampus/Keycloak 인증 + 독립 private PostgreSQL + container 기반 MSA다.
- 공공기관 환경에서는 WEB/WAS/DB zone, VPC peering, Keycloak, LMS readonly DB 같은 운영 경계가 핵심 리스크다.
- 이 리스크는 화면 MVP를 모두 완성한 뒤 한 번에 검증하기보다, 현재 provider/repository contract가 살아 있을 때 작게 검증하는 편이 안전하다.
- 로컬 Docker network/profile은 실제 VPC peering을 완벽히 재현하지는 않지만, 서비스 간 접근 가능성과 runtime env contract를 검증하기에 충분하다.

## Scope Boundary

### In Scope

- local Docker Compose 기반 integration profile
- simulated public / was / db / auth / lms private networks
- PS Track app container
- PS Track private PostgreSQL container
- Compose network skeleton
- DB host port exposure 제거
- 문서화와 검증 로그

### Confirmed External Information

- Keycloak version: `v26.0.4` on JDK 17.
- Production realm: `kird`.
- Client id pattern: `kird-[target-system-english-name]`; tentative PS Track value is `kird-ps-track-dashboard`.
- Client type: `confidential`, with secret delivered out-of-band.
- JWT verification: AlphaCampus/LMS gateway verifies tokens before forwarding requests.
- Claims available by default: LMS member `uuid`, `email`, `username/login_id`.
- Role claim is optional and can be requested later.
- Local realm export is not expected to be provided.

### Deferred Until External Confirmation

- Whether a local Keycloak simulation is still valuable without a production realm export
- Keycloak 전용 PostgreSQL container, only if local simulation is approved
- LMS mock DBMS selection
- LMS mock table/schema shape
- `/api/ready` readiness endpoint

### Prepared Without External Confirmation

- LMS readonly view contract draft
- LMS internal content mapping model draft
- operator pre-mapping flow
- student self-link secondary flow
- `LMS_PROVIDER=none|mock-view` provider contract

### Out of Scope

- 실제 공공기관 클라우드 배포 자동화
- 실제 VPC peering 구성
- 실제 AlphaCampus/LMS DB 전체 복제
- LMS DB write integration
- production-grade Keycloak 보안 완성
- 화면/UI 고도화의 중단 또는 후순위 전체 전환

## Target Local Topology

```text
public_zone
  reverse proxy / ingress simulator

was_zone
  ps-track-dashboard

db_zone
  ps-track-postgres

auth_zone
  keycloak
  keycloak-postgres

lms_private_zone
  lms-mock-postgres
```

`ps-track-dashboard`는 필요한 network에만 연결한다. 이 방식으로 실제 VPC peering의 핵심인 "어느 서비스가 어느 사설 endpoint에 접근 가능한가"를 로컬에서 검증한다.

## Proposed Compose Profiles

| profile | purpose |
| --- | --- |
| `postgres` | PS Track private PostgreSQL only |
| `keycloak` | Optional local simulation with Keycloak `v26.0.4`; no production realm export expected |
| `lms-mock` | Deferred until LMS DBMS/table shape is confirmed |
| `integration` | Deferred until Keycloak and LMS mock decisions are confirmed |

## Implementation Plan

1. Add profile-based network separation to the existing compose file.
2. Add `public_zone`, `was_zone`, `db_zone`, `auth_zone`, `lms_private_zone` Docker networks.
3. Attach the app container to reserved auth/LMS networks so Docker creates the local peering skeleton.
4. Keep Keycloak and LMS services out until their versions/environments are confirmed.
5. Verify the existing app and PostgreSQL services still run.
6. Document the network skeleton and deferred decisions.

## Recommended Work Order

### PR 1: Compose Network Skeleton

- Add integration compose file or profiles.
- Define simulated networks.
- Keep existing single-service smoke flow working.
- Do not add Keycloak/LMS yet.
- Keep PostgreSQL private to `db_zone`; do not publish DB port to the host.

### PR 2: Keycloak Local Simulation

- Use Keycloak `v26.0.4` only if local simulation is still useful without a production realm export.
- Add Keycloak + Keycloak DB profile if approved.
- Add a synthetic local realm/client draft, not a production `kird` export.
- Verify Keycloak boots locally and can emit equivalent `uuid`, `email`, and `username` claims.
- Keep app auth in `mock` unless explicitly testing `keycloak`.

### PR 3: LMS Mock DB

- Use local PostgreSQL only to simulate the agreed readonly view contract before real LMS connection details arrive.
- Add LMS mock PostgreSQL profile.
- Add minimal local-only LMS source tables, seed rows, and readonly contract views.
- Add readonly DB user if practical.
- Verify PS Track container cannot write to LMS mock DB in the intended flow.

### PR 4: LMS Adapter Contract

- Add `LMS_PROVIDER=none|mock-view|readonly-db`.
- Add readonly view contract for content catalog and learning records.
- Add internal mapping model draft.
- Keep deep LMS integration out of scope.

### PR 5: Readiness Endpoint

- Add `/api/ready`.
- Check PS Track DB only when `REPOSITORY_PROVIDER=postgres`.
- Check LMS only when `LMS_PROVIDER=mock-view`, `LMS_PROVIDER=readonly-db`, or a future real LMS provider is enabled.
- Check Keycloak only when `AUTH_PROVIDER=keycloak` or integration test profile enables it.

## Stop Conditions

Pause this track if any of the following happens:

- Docker work starts blocking core MVP domain completion.
- Keycloak/LMS simulation requires large real LMS schema replication.
- Security assumptions become speculative without institutional input.
- Local compose complexity grows beyond what can be explained to a future maintainer in one page.

## Decision Summary

Proceed with a local Docker integration MVP as a controlled validation branch. Treat it as an operations-readiness track, not as a replacement for the current MVP implementation flow.
