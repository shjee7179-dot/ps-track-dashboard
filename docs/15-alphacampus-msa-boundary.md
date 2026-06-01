# AlphaCampus MSA Target Architecture

이 문서는 미래 의사과학자 챌린지 트랙 학습 여정 대시보드의 최종 운영 목적지를 정리한다. 현재 MVP는 폐기하지 않고, 아래 목표 아키텍처로 이동 가능한 독립 MSA의 도메인/화면/데이터 검증 산출물로 유지한다.

## Target Position

본 시스템은 AlphaCampus 본체 기능이 아니라 독립 MSA로 운영한다.

```text
AlphaCampus / Keycloak
  - login
  - SSO subject
  - minimal user / eligibility lookup

PS Track MSA
  - learning journey
  - artifacts
  - mentoring records
  - feedback
  - evaluations
  - learning outcomes
  - audit / access logs
  - program operation settings
```

## Final Operating Assumption

- Container 기반 배포를 기본 전제로 둔다.
- 운영 인프라는 NHN Cloud 공공 환경 또는 기관 승인 공공 클라우드를 전제로 한다.
- WEB/WAS container와 private PostgreSQL을 분리할 수 있어야 한다.
- 인증은 AlphaCampus/Keycloak SSO를 사용한다.
- PS Track 운영 데이터는 독립 PostgreSQL이 소유한다.
- AlphaCampus 연동은 인증과 최소 조회에 한정한다.

## Integration Boundary

### AlphaCampus에서 받는 것

- Keycloak subject 또는 AlphaCampus 사용자 식별자
- 이름
- 이메일
- 소속/기관
- 참여 자격 또는 과정/기수 매핑에 필요한 최소 정보

### PS Track이 자체 소유하는 것

- role / scope 권한 배정
- module / content / learning piece 운영 구조
- 학생별 학습피스 상태
- 산출물과 제출 버전
- 멘토링 기록
- 피드백
- 루브릭 평가
- 학습성과 evidence
- 리스크/리마인더 운영 기록
- 감사 로그와 접속 로그
- 시스템 설정

### 하지 않는 것

- AlphaCampus DB에 PS Track 산출물/평가/멘토링 데이터를 저장하지 않는다.
- AlphaCampus DB를 일반 운영 데이터 저장소처럼 사용하지 않는다.
- 양방향 동기화를 기본값으로 두지 않는다.
- LMS/AlphaCampus DB 직접 쓰기 권한을 요구하지 않는다.
- PS Track 내부 권한을 Keycloak role만으로 표현하지 않는다.

## Provider Strategy

현재 MVP의 provider 구조는 유지한다.

| concern | MVP / validation | target |
| --- | --- | --- |
| Auth | mock, Supabase validation provider | AlphaCampus/Keycloak provider |
| Repository | mock, Supabase users repository | private PostgreSQL repository |
| DB | PostgreSQL-compatible SQL draft | private PostgreSQL |
| Deployment | local Next.js / future container | Docker container MSA |

향후 provider는 다음처럼 확장한다.

```text
AUTH_PROVIDER=mock | supabase | keycloak
REPOSITORY_PROVIDER=mock | supabase | postgres
```

Supabase 관련 코드는 최종 운영 목적지가 아니라 PostgreSQL/Auth adapter 검증 자산으로 유지한다.

## Migration Value of Current MVP

현재까지의 MVP 산출물은 유지한다.

- IA / PRD / SRS / route map
- role + scope 권한 모델
- `SessionProvider` contract
- `AppRepositories` contract
- PostgreSQL 기준 schema / seed / RLS draft
- server action guard pattern
- 화면과 사용자 흐름
- 작업 히스토리

나중에 Spring Boot/MyBatis 또는 Node WAS로 재구현하더라도, 위 산출물은 테이블 정의, API 명세, 권한 매트릭스, 화면 요구사항으로 재사용한다.

## Near-Term Work Order

1. Container 실행 가능성 확보
2. private PostgreSQL migration 형태 정리
3. AlphaCampus/Keycloak provider 설계
4. 최소 사용자/참여 자격 조회 adapter 설계
5. read page의 `mockRepositories` 직접 import를 `repositories` selector로 점진 전환
6. API/OpenAPI contract 정리

## Audit Posture

공공 운영 전에는 다음 산출물을 별도로 준비한다.

- 개인정보 처리 흐름도
- 권한 매트릭스
- 접속기록/감사로그 보관 정책
- 클라우드 이용 적합성 검토
- 외부 연동 데이터 최소화 근거
- 오픈소스 취약점 조치대장
- container 배포/운영 절차
