# Work History

이 문서는 미래 의사과학자 챌린지 트랙 학습 여정 대시보드 개발 흐름을 추후 구조화해 정리할 수 있도록 남기는 작업 기록이다. 프로젝트가 끝날 때까지 유지하며, 큰 방향 전환이나 PR 단위 작업이 끝날 때마다 갱신한다.

## 운영 원칙

- 초반에는 세부 task를 과도하게 쪼개기보다, 작동하는 MVP 지도를 먼저 만든다.
- 학생 개인 기준을 기본 축으로 두고, 객체와 일정은 필터와 연결 정보로 붙인다.
- 화면은 넓게 만들되, 완료 상태는 나중에 `Mock`, `Functional`, `Verified`, `Deferred`로 구분해 보완한다.
- 코드 구조는 처음부터 완벽히 분리하기보다, 관계가 보인 뒤 자연스러운 경계로 모듈화한다.
- 각 작업은 작은 PR 단위로 병합하고, build 검증을 완료 기준에 포함한다.

## 기획 결정 히스토리

### 시스템 정체성

- 시스템명: 미래 의사과학자 챌린지 트랙 학습 여정 대시보드
- 핵심 관점: 학생 개인 기준 학습 여정
- 보조 관점: 객체, 일정, 산출물, 성과, 멘토링, 운영 리스크
- 개발 방식: 바이브코딩 기반으로 MVP 윤곽을 빠르게 만든 뒤 반복 보강

### 역할과 권한

- 사용자 역할: 학생참여자, 프로그램운영자, 연구책임자/PI, 멘토, 시스템 총괄 관리자
- 권한 모델: 처음부터 `role + scope` 구조로 설계
- scope 후보: system, program, cohort, track, team, student

### 운영 주기

- 2026년도 프로그램은 6월 협약 후 7월부터 10월까지 운영
- 이후 기수별 반복 운영을 전제로 설계
- 기수 복제 시 1~6번 성격의 템플릿 데이터는 복제 가능
- 실제 운영 데이터와 로그성 데이터는 복제하지 않음
- 일정은 실제 날짜 대신 상대 일정 템플릿을 둔다

### 객체 구조

- 기본 구조: module -> content -> learning piece -> artifact/outcome
- 콘텐츠 범위: 강의, 읽기자료, 워크숍, 과제, 실습, 링크, 오프라인 활동
- 운영 공지는 콘텐츠와 분리된 별도 notice 객체로 관리
- 산출물은 개인/팀 모두 가능하고, 여러 개 존재할 수 있음

### 멘토링

- 화상/채팅은 외부 도구 링크로 처리
- 시스템은 멘토링의 기록, 후속 액션, 산출물 연결, 피드백을 관리

### 대시보드 관점

- 학생 화면: 해야 할 일 중심, 성장감은 보조 축
- PI 화면: 성과와 품질 중심, 운영 현황은 요약
- 운영자 화면: 조치 가능한 신호 중심

## 구현 히스토리

### Sprint 0 성격의 기반 작업

- `ps-track-dashboard` 앱을 별도 프로젝트로 분리
- GitHub 신규 리포지토리 생성
- Next.js 기반 앱 골격 생성
- 로컬 개발 서버로 화면 확인
- 기본 문서 세트 작성: IA, MVP scope, PRD, SRS, roadmap, permission model, route map

### MVP 화면 골격

- 역할별 대시보드 구현
- 학생 여정 화면 구현
- 모듈, 콘텐츠, 학습피스 객체 화면 구현
- 산출물 목록, 상세, 리뷰, 평가 화면 구현
- 성과/학습성과 화면 구현
- 멘토링 목록과 상세 기록 화면 구현
- 리스크/리마인더 운영 화면 구현
- 설문/응답 기초 화면 구현
- 리포트/CSV 내보내기 화면과 API 구현
- 사용자, 역할/scope, 감사 로그, 접속 로그, PWA 설정, 시스템 설정 화면 구현

### 병합된 PR 흐름

- PR #10: route access policy 기반 페이지 보호
- PR #11: mock session helper 추가
- PR #12: domain type 분리
- PR #13: mock data 분리
- PR #14: permission helper 분리
- PR #15: report/export helper 분리
- PR #16: mentoring helper 분리와 작업 히스토리 문서 생성
- PR #17: risk/reminder helper 분리
- PR #18: journey helper 분리
- PR #19: artifact helper 분리
- PR #20: evaluation/outcome helper 분리
- PR #21: MVP completion ledger 작성
- PR #22: Auth/session + persistence 전환 준비
- PR #23: mock repository implementation 추가
- PR #24: session helper를 SessionProvider contract에 맞게 보강
- PR #25: 학생 대시보드를 repository 경유로 전환하고 LMS 연동을 Future Integration Track으로 분리
- PR #26: 학습피스 상태 변경 server action guard 구현
- PR #27: 산출물 제출 server action guard 구현
- PR #28: 산출물 피드백 생성 server action guard 구현
- PR #29: 산출물 루브릭 평가 제출 server action guard 구현
- PR #30: 멘토링 기록 저장 server action guard 구현
- PR #31: 리스크/리마인더 조치 상태 저장 server action guard 구현
- PR #32: 남은 mock action/read path completion pass
- PR #33: 주요 read-heavy route repository 전환 확대
- PR #34: 학생별 여정 목록/상세 repository 전환
- PR #35: 산출물 상세/리뷰/평가 repository 전환
- PR #36: 멘토링 상세 repository 전환
- PR #37: 학습성과 목록/상세 repository 전환
- PR #38: 기수/팀 상세 repository 전환
- PR #39: Supabase/Auth 전환 경계와 환경 계약 준비
- PR #40: Core Auth/Scope Schema SQL 초안 작성
- PR #41: Supabase SDK 설치와 client factory 구현
- PR #42: Supabase session provider 초안 구현
- PR #43: `AUTH_PROVIDER=mock|supabase` switch 구현

## 현재 진행 흐름

### Users / Role Assignments DB-backed Repository

- 목적: Auth/session의 기준 데이터인 users와 role assignments를 Supabase/Postgres에서 읽을 수 있는 첫 DB-backed repository 구현
- 산출물:
  - `src/lib/supabase/repositories.ts`
  - `src/lib/repositories.ts`
  - `src/lib/supabase/session-provider.ts`
  - `docs/AUTH_PERSISTENCE_PREP.md`
  - `docs/SUPABASE_TRANSITION_PLAN.md`
- 주요 결정:
  - `supabaseUserRepository`가 `listUsers`, `getUserById`, `listRoleAssignments`를 구현한다.
  - `REPOSITORY_PROVIDER=mock|supabase` selector를 추가한다.
  - 기본값은 여전히 mock이다.
  - `REPOSITORY_PROVIDER=supabase`일 때 현재는 users domain만 DB-backed이고 나머지는 mock fallback이다.
  - `supabaseSessionProvider`는 role assignment 조회 로직을 새 users repository로 위임한다.
- 활용 방식: 후속 PR에서 read page imports를 `mockRepositories`에서 `repositories`로 점진 전환하고, 실제 Supabase seed/RLS 검증을 진행

### 다음 예정 작업

- core schema seed/RLS 초안 작성
- read pages의 `mockRepositories` 직접 import를 `repositories` selector로 점진 전환

## 열린 판단

- `DOCS/`와 `docs/`가 동시에 존재하므로, 문서 폴더 표준화가 필요하다.
- 현재 구현은 mock 기반 MVP이며, 실제 운영 제품화를 위해 Auth, DB, 저장, 업로드, 이벤트 로그 자동 기록, 배포가 필요하다.
- UI 디자인 고도화는 후순위로 두고, 우선 구조와 기능 경계를 안정화한다.
