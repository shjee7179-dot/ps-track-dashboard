# Codex Architecture Proposal: 레거시 협력 및 공공망 전환 후보안

상태: Future Integration Track / Legacy Cooperation Proposal  
적용 범위: 현재 MVP 본선 설계를 대체하지 않으며, AlphaCampus/LMS 운영 환경과 공공망 배포 조건이 확정된 뒤 검토할 후보 아키텍처다.

이 문서는 PS Track 대시보드를 기존 LMS 코어 시스템과 느슨하게 연계하면서도, 내부 담당자가 바이브코딩(AI 협업 코딩)으로 일정 수준까지 계속 운영·개선할 수 있도록 하기 위한 후보 아키텍처와 운영 조건을 정리한다.

현재 MVP 본선의 원칙은 유지한다.

- PS Track은 독립 애플리케이션으로 운영한다.
- 인증은 AlphaCampus/LMS Keycloak 또는 gateway 책임으로 둔다.
- LMS 데이터는 읽기 전용 view 또는 adapter를 통해 최소 범위로 조회한다.
- PS Track 고유 데이터는 별도 PostgreSQL에 소유한다.
- repository contract를 통해 mock, local Postgres, 향후 LMS 연계 구현을 교체 가능하게 유지한다.

## 1. 결론

이 문서는 폐기하지 않고 보관한다. 다만 현재 MVP의 본선 설계가 아니라, 레거시 협력과 공공기관 운영 환경 전환을 위한 후보안으로 위치를 낮춘다.

채택 가능한 방향은 다음과 같다.

- 컨테이너 기반 독립 WAS 배포는 현재 방향과 잘 맞는다.
- PS Track 전용 private PostgreSQL을 두는 방식도 현재 방향과 일치한다.
- LMS DB 직접 수정은 하지 않는다.
- LMS 데이터는 읽기 전용 view 또는 별도 제공 view를 통해 조회한다.
- FDW(PostgreSQL Foreign Data Wrapper)는 가능한 선택지지만 기본값으로 확정하지 않는다.
- Drizzle ORM은 지금 MVP 본선에 섞지 않고, 향후 신규 스키마나 마이그레이션 자동화 후보로 둔다.

## 2. 권장 아키텍처

```text
[Public Zone]
  Load Balancer / Gateway
        |
        v
[Private WAS Zone]
  PS Track Next.js Container
        |
        v
[Private DB Zone]
  PS Track PostgreSQL
        |
        +-- PS Track owned tables
        +-- optional integration layer
              |
              +-- Option A: WAS readonly adapter -> LMS readonly view
              +-- Option B: PostgreSQL FDW -> LMS readonly view

[Legacy LMS Private DB Zone]
  LMS readonly views only
```

### 핵심 원칙

- PS Track WAS와 DB는 LMS 코어와 물리적 또는 논리적으로 분리한다.
- LMS DB에는 쓰기 권한을 두지 않는다.
- LMS 원본 테이블을 직접 조회하지 않고, 운영팀이 제공한 읽기 전용 view만 조회한다.
- 사용자 식별자는 Keycloak/LMS의 UUID 또는 합의된 subject key를 기준으로 매핑한다.
- 과정/기수/콘텐츠 식별자는 LMS view의 값을 PS Track의 `lms_content_mappings`와 연결한다.

## 3. LMS 연계 방식 비교

| 방식 | 설명 | 장점 | 리스크 | 권장 판단 |
| --- | --- | --- | --- | --- |
| WAS readonly adapter | PS Track 애플리케이션이 LMS readonly view에 별도 read connection으로 접근 | 구조가 명확하고 장애 격리가 쉽다. 앱 레벨에서 timeout, fallback, cache를 제어하기 좋다. | 앱이 DB connection을 2개 관리한다. 운영 보안 정책상 추가 접속 허가가 필요하다. | 1차 실연계 기본 후보 |
| PostgreSQL FDW | PS Track DB가 LMS readonly view를 foreign table로 마운트 | 앱은 PS Track DB 하나만 바라본다. SQL join이 단순해질 수 있다. | DB 간 장애 전파, credential 보관, query 성능 통제가 필요하다. DBA 검토가 필요하다. | 운영팀과 DBA가 승인할 경우 후보 |
| 주기적 복제/적재 | LMS view를 PS Track DB에 주기적으로 동기화 | 화면 성능과 장애 격리가 좋다. 이력화가 쉽다. | 실시간성이 낮고 적재 작업 운영이 필요하다. | 데이터 갱신 주기가 느슨해질 때 후보 |

현재는 WAS readonly adapter를 우선 후보로 두고, FDW는 보안·성능·운영 조건이 맞을 때 선택한다.

## 4. FDW 적용 조건

FDW를 선택하려면 다음 조건이 필요하다.

- LMS 운영팀이 read-only view를 별도로 제공한다.
- FDW 계정은 view에 대한 `SELECT` 권한만 가진다.
- 원본 테이블 접근 권한은 부여하지 않는다.
- VPC peering, 보안그룹, 방화벽에서 필요한 포트만 허용한다.
- statement timeout, connection timeout, row limit, 필요한 index 또는 view 최적화를 확정한다.
- LMS 장애 또는 지연이 PS Track 화면 전체 장애로 번지지 않도록 fallback 정책을 둔다.
- 개인정보 컬럼은 view 단계에서 최소화하거나 마스킹한다.
- FDW 접속 정보와 credential 보관 방식은 운영 보안 정책에 맞춘다.

FDW는 “보안 심의를 쉽게 통과시키는 장치”가 아니라, 운영팀과 DBA가 통제 가능한 조회 경로로 승인할 때 유효한 선택지다.

## 5. Drizzle ORM 적용 판단

현재 MVP는 raw SQL 기반 repository와 SQL migration 파일로 이미 상당 부분 안정화되어 있다. 따라서 Drizzle ORM을 지금 본선에 급하게 섞지 않는다.

향후 적용한다면 다음 원칙을 둔다.

- 기존 검증된 repository 코드는 유지한다.
- 신규 테이블 또는 신규 기능부터 제한적으로 검토한다.
- production DB에는 컨테이너 시작 시 자동 migration을 기본값으로 두지 않는다.
- Drizzle이 생성한 SQL은 DBA 또는 운영자가 검토한 뒤 적용한다.
- schema drift를 줄이는 보조 도구로 사용하되, 운영 승인 절차를 우회하지 않는다.

즉, Drizzle은 바이브코딩의 생산성을 높이는 후보 도구이지, 현재 MVP의 필수 전제는 아니다.

## 6. 바이브코딩 유지보수 가능성

레거시 환경에 배포한 뒤에도 PS Track을 어느 정도까지 바이브코딩으로 관리하는 것은 가능하다. 다만 가능 범위를 명확히 나눠야 한다.

### 바이브코딩으로 관리하기 적합한 범위

- 화면 문구와 운영자 UI 개선
- 대시보드 지표 카드 추가
- repository contract를 유지한 읽기 화면 추가
- 공지, 멘토링, 산출물, 평가 등 PS Track 내부 기능 개선
- 문서, 운영 가이드, 배포 체크리스트 보완
- mock 데이터와 local Docker 기반 재현 테스트
- LMS view 명세가 확정된 뒤 adapter mapping 보강

### 바이브코딩만으로 처리하면 위험한 범위

- 운영 DB schema 직접 변경
- Keycloak/gateway 인증 정책 변경
- 개인정보 보관 범위 확대
- LMS DB view 권한 또는 네트워크 보안그룹 변경
- production migration 자동 적용
- 대량 데이터 성능 튜닝과 장애 대응 정책 확정
- 공공기관 보안 심의 답변의 최종 확정

### 유지보수를 위해 지금 보완해야 할 것

- repository contract를 계속 유지해 구현체를 교체 가능하게 둔다.
- `AUTH_PROVIDER`, `REPOSITORY_PROVIDER`, `LMS_PROVIDER` 같은 provider switch를 문서와 환경변수로 명확히 관리한다.
- local Docker 환경에서 app, private Postgres, mock LMS view를 재현 가능하게 유지한다.
- server action, repository write, audit log의 책임 경계를 문서화한다.
- production migration은 자동 실행이 아니라 검토 가능한 SQL 산출물 중심으로 둔다.
- LMS 연계는 view contract와 sample row 기반으로 먼저 개발하고, 실제 접속 정보는 마지막에 붙인다.
- 운영자가 수정 가능한 설정과 개발자가 수정해야 하는 코드를 분리한다.
- 변경 이력은 `docs/WORK_HISTORY.md`와 PR 단위로 계속 남긴다.

## 7. 현재 개발 방향에 주는 영향

이 문서는 현재 개발 방향을 뒤집지 않는다. 오히려 현재 방향을 더 명확히 뒷받침한다.

- 지금은 MVP 본선 완성에 집중한다.
- Supabase/Auth 전환 준비 작업은 향후 Keycloak/gateway 전환을 고려한 provider 구조로 유지한다.
- LMS DB 명세가 완전히 오기 전까지는 mock LMS view와 contract 중심으로 개발한다.
- 실제 공공망 전환 시에는 Docker, private PostgreSQL, Keycloak trusted header/session, LMS readonly view adapter를 기준으로 마이그레이션한다.
- FDW와 Drizzle은 운영팀/DBA/SI 협력 조건이 맞을 때 검토하는 선택지로 둔다.

## 8. 최종 권고

PS Track은 현재처럼 독립 MVP를 완성한 뒤, 다음 순서로 공공기관 운영 환경에 맞춰 전환하는 것이 적절하다.

1. MVP 기능 완성 및 local Docker 검증
2. private PostgreSQL schema와 seed SQL 안정화
3. Keycloak/gateway 인증 경계 확정
4. LMS readonly view contract 확정
5. WAS readonly adapter로 1차 실연계
6. 운영 여건에 따라 FDW 또는 복제/적재 방식 검토
7. 신규 기능에 한해 Drizzle 등 schema tooling 점진 검토

이 방식이면 레거시 LMS를 건드리지 않으면서도, 내부 담당자가 바이브코딩으로 개선 가능한 범위를 현실적으로 확보할 수 있다.
