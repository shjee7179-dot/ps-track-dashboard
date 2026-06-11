# MVP Completion Ledger

이 문서는 Sprint 0~5의 구현 상태를 `완료/미완료`처럼 단순 판정하지 않고, 현재 MVP가 어느 수준까지 작동하는지 기록한다. 앞으로 기능 PR이 병합될 때 함께 갱신한다.

## 상태 정의

| 상태 | 의미 |
| --- | --- |
| Verified Mock | mock data 기반이지만 화면, 타입, 빌드, 주요 라우트 확인까지 완료 |
| Functional Mock | mock data 기반으로 사용 흐름은 동작하나, 저장/권한/입력 검증 등 실제 운영 로직은 미완 |
| UI Mock | 화면은 있으나 실제 동작은 안내/표시 중심 |
| Deferred | 1차 MVP에서 구조만 고려하거나 후순위로 미룸 |

## 전체 판단

| 관점 | 현재 상태 | 판단 |
| --- | --- | --- |
| MVP 화면 지도 | Verified Mock | P0/P1 주요 화면은 대부분 구성됨 |
| 도메인 구조 | Verified Mock | types, mock-data, permissions, reports, mentoring, risks, journeys, artifacts, evaluations, outcomes 분리 완료 |
| 실제 운영 기능 | Functional Mock | 상태 변경, 제출, 피드백, 평가, 설정 저장은 persistence 전 단계 |
| 실서비스 준비 | UI Mock | Auth, DB, 파일 업로드, 이벤트 로그 자동 기록, 배포가 필요 |

## Sprint 0: 시스템 뼈대 / 운영 기반

| 항목 | 상태 | 근거 | 남은 Gap |
| --- | --- | --- | --- |
| 로그인 / 역할별 라우팅 | Functional Mock | `/login`, role query, mock session helper, Keycloak mode SSO landing | 실제 Auth/session 저장 |
| 공통 레이아웃 | Verified Mock | `AppShell`, 공통 nav, 역할별 route 접근 정책 | UI 디자인 고도화 |
| 권한 + scope 기본 구조 | Verified Mock | `role + scope`, route access policy, permission helper 분리 | 서버 액션/API 권한 강제 |
| 2026년 기수 seed 데이터 | Verified Mock | cohort, teams, participants, schedule mock data | DB seed/migration |
| 감사 로그 | UI Mock | 감사 로그 화면과 mock data | 실제 이벤트 기록 자동화 |
| 접속 로그 | UI Mock | 접속 로그 화면과 mock data | 실제 session/access 기록 |
| 인증 진단 | Functional Mock | Keycloak trusted-header 화면/API | 실제 LMS gateway smoke |
| 전체 시스템 설정 | UI Mock | 설정 화면과 mock data | 저장/적용 로직 |
| PWA manifest / 설정 화면 | Functional Mock | manifest, PWA 설정 화면, 품질 체크 mock | 실제 install QA, 아이콘/캐시 전략 보강 |

## Sprint 1: 학생 여정 중심 MVP

| 항목 | 상태 | 근거 | 남은 Gap |
| --- | --- | --- | --- |
| 학생 대시보드 | Verified Mock | `/student`, 해야 할 일 + 성장 요약 | 실제 학생 session 연결 |
| 학생 상세 | Verified Mock | `/journeys/students/[studentId]`, LMS mock-view overlay | 운영자/멘토 scope 기반 접근 제한 강화 |
| 학습피스 목록 / 상세 | Verified Mock | `/objects/learning-pieces`, 상세 라우트, LMS mock-view 상태 표시 | 상태 변경/제출 액션 |
| 학습피스 상태 | Functional Mock | 상태 데이터와 라벨, `/journeys/status`, LMS 완료 수동 반영 action | 상태 변경 persistence |
| 학생별 학습 여정 | Verified Mock | 학생별 타임라인, LMS 수료 기록 overlay, 목록 LMS 요약 | 실제 완료 규칙 계산 |

## Sprint 2: 산출물과 멘토링

| 항목 | 상태 | 근거 | 남은 Gap |
| --- | --- | --- | --- |
| 산출물 제출 / 상세 | Functional Mock | `/artifacts`, `/artifacts/[artifactId]`, submission mock | 파일 업로드, 제출 저장, 버전 정책 |
| 산출물 리뷰 | Functional Mock | `/artifacts/[artifactId]/review`, feedback mock | 피드백 작성/해결 저장 |
| 멘토링 일정 | Verified Mock | `/mentoring/sessions`, mentoring helper 분리 | 캘린더 연동/일정 수정 |
| 멘토링 기록 | Functional Mock | `/mentoring/sessions/[sessionId]`, 기록/후속 액션 표시 | 기록 작성/수정 저장 |
| 피드백 이력 | Functional Mock | artifact feedback, mentoring link 구조 | 통합 피드백 타임라인 |

## Sprint 3: 운영자 화면

| 항목 | 상태 | 근거 | 남은 Gap |
| --- | --- | --- | --- |
| 기수 대시보드 | Verified Mock | `/cohorts/2026` | 실제 집계 쿼리 |
| 참여자 관리 | Verified Mock | `/cohorts/2026/participants`, `/admin/users` | 생성/수정/초대 |
| 팀 관리 | Verified Mock | `/cohorts/2026/teams`, 팀 상세 | 팀 편성 저장 |
| 멘토 배정 | UI Mock | `/cohorts/2026/mentor-assignments` | 배정 편집/검증 |
| 위험군 / 리마인드 추천 | Functional Mock | `/operations/risks`, risk helper 분리 | 자동 탐지 규칙, 발송 이력 |
| 공지 작성 | UI Mock | `/notices`, `/notices/new` | 작성/발행 저장 |

## Sprint 4: 평가와 성과

| 항목 | 상태 | 근거 | 남은 Gap |
| --- | --- | --- | --- |
| 루브릭 평가 | Functional Mock | `/artifacts/[artifactId]/evaluation`, evaluations helper 분리 | 평가 입력/제출 저장 |
| 학습성과 목록 | Verified Mock | `/outcomes`, outcomes helper 분리 | 성과 관리 CRUD |
| 학습성과 매핑 | Functional Mock | rubric item outcome mapping mock | 매핑 편집 UI/API |
| 학생별 성과 증거 | Functional Mock | outcome evidence mock, 상세 화면 | 증거 자동 생성/검증 |
| PI 대시보드 | Verified Mock | `/pi/dashboard`, 성과/품질 중심 요약 | 실제 지표 쿼리와 필터 |

## Sprint 5: 템플릿 / 리포트 / 모바일 품질

| 항목 | 상태 | 근거 | 남은 Gap |
| --- | --- | --- | --- |
| 프로그램 템플릿 | Functional Mock | `/templates`, program template mock | 템플릿 작성/수정 |
| 상대 일정 템플릿 | Functional Mock | schedule preview helper | 기수 생성 시 날짜 확정 로직 |
| 설문 링크 / 응답 여부 | Functional Mock | `/surveys`, `/surveys/responses` | 외부 설문 연동/응답 동기화 |
| CSV 내보내기 | Verified Mock | `/reports/exports`, export API, report helper 분리 | 권한/필터/대용량 처리 |
| 모바일 최적화 점검 | UI Mock | 반응형 레이아웃과 PWA 화면 | 실제 모바일 QA 체크리스트 |
| PWA 품질 점검 | UI Mock | PWA settings/check mock | Lighthouse/installability 검증 |

## P0 화면 체크

| 범위 | 상태 |
| --- | --- |
| 로그인 / 역할 선택 | Functional Mock |
| 내 대시보드 | Verified Mock |
| 2026년 기수 대시보드 / 상세 | Verified Mock |
| 참여자 / 학생 / 팀 / 멘토 배정 | Functional Mock |
| 모듈 / 콘텐츠 / 학습피스 | Verified Mock |
| 학생별 학습 여정 / 상태 관리 | Functional Mock |
| 산출물 / 리뷰 / 루브릭 평가 | Functional Mock |
| 멘토링 일정 / 기록 | Functional Mock |
| 위험군 / 리마인드 추천 | Functional Mock |
| 공지사항 | UI Mock |
| 사용자 / 역할 / scope 관리 | Functional Mock |
| 인증 진단 | Functional Mock |
| 감사 로그 / 접속 로그 | UI Mock |
| PWA / 전체 시스템 설정 | UI Mock |

## 다음 제품화 Gap

1. 실제 Auth/session과 role+scope 서버 권한 적용
2. DB schema 확정과 mock data -> persistence 전환
3. 산출물 제출/파일 업로드/버전 관리
4. 피드백, 멘토링 기록, 평가 입력 저장
5. 로그 자동 기록과 운영 이벤트 수집
6. 리포트 필터, 권한, CSV export 품질 강화
7. 모바일/PWA 실제 기기 QA
8. UI 디자인 고도화

## 전환 준비 기록

| 항목 | 상태 | 근거 |
| --- | --- | --- |
| Auth/session contract | Functional Mock | `src/lib/session-contract.ts`, `mockSessionProvider` |
| Repository contract | Planned | `src/lib/repository-contracts.ts` |
| 전환 순서 문서 | Planned | `docs/AUTH_PERSISTENCE_PREP.md` |
| mock repository implementation | Planned | `src/lib/mock-repositories.ts` |
| 첫 server action guard | Functional Mock | 학습피스 상태 변경 mock action |
| 산출물 제출 action guard | Functional Mock | 산출물 상세 제출 등록 mock action |
| 피드백 생성 action guard | Functional Mock | 산출물 리뷰 피드백 등록 mock action |
| 평가 제출 action guard | Functional Mock | 산출물 루브릭 평가 제출 mock action |
| 멘토링 기록 action guard | Functional Mock | 멘토링 상세 기록 저장 mock action |
| 리스크/리마인더 action guard | Functional Mock | 운영 리스크/리마인더 조치 상태 저장 mock action |
| 공지 생성 action guard | Functional Mock | 공지 작성 mock action |
| mock completion note | Documented | `docs/MOCK_COMPLETION_NOTES.md` |
| LMS readonly mock-view | Functional Mock | catalog selector, learning record overlay |

## 최근 검증 기준

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- 주요 라우트 `curl -I` 확인

현재 Ledger 기준일: 2026-06-11
