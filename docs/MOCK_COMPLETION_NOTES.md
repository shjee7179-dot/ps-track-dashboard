# Mock Completion Notes

이 문서는 mock 기반 MVP에서 쓰기 동작과 repository 전환 준비가 어디까지 왔는지 정리한다.

## 완료된 mock action guard

- 학습피스 상태 변경
- 산출물 제출
- 산출물 피드백 생성
- 산출물 루브릭 평가 제출
- 멘토링 기록 저장
- 리스크/리마인더 조치 상태 저장
- 공지 생성

## repository read path 전환 현황

- `/student`: 학생 대시보드 repository 경유
- `/artifacts`: 산출물 목록 repository 경유
- `/artifacts/[artifactId]`: 산출물 상세, 제출 이력, 피드백, 평가 수 repository 경유
- `/artifacts/[artifactId]/review`: 산출물 리뷰 큐와 피드백 작성 화면 repository 경유
- `/artifacts/[artifactId]/evaluation`: 루브릭, 항목, 평가, 항목별 점수 repository 경유
- `/mentoring/sessions`: 멘토링 목록 repository 경유
- `/mentoring/sessions/[sessionId]`: 멘토링 상세, 멘토/대상/연결 산출물 repository 경유
- `/operations/risks`: 리스크/리마인더 목록 repository 경유
- `/notices`: 공지 목록 repository 경유
- `/notices/new`: 활성 기수 조회 repository 경유
- `/journeys/students`: 학생 목록과 여정 요약 repository 경유
- `/journeys/students/[studentId]`: 학생 상세, 여정 타임라인, 활동 로그 repository 경유
- `/journeys/status`: 학습피스 상태 목록 repository 경유
- `/objects/learning-pieces`: 학습피스/학생 상태 목록 repository 경유
- `/cohorts/2026`: 기수 운영 요약의 주요 목록 repository 경유
- `/pi/dashboard`: 산출물/평가/리스크 목록 repository 경유

## route access 보정

- `/journeys/status`: 문서와 화면은 존재했지만 route access policy가 없어 AppShell에서 차단되던 항목을 운영자/멘토 접근 화면으로 보정

## 현재 mock mutation의 한계

- `mockRepositories`는 mutation 결과와 audit id를 반환하지만 실제 mock 배열을 영구 변경하지 않는다.
- 따라서 server action guard, 권한 검사, redirect, revalidate 흐름 검증이 목적이다.
- 새로 생성/수정된 데이터가 reload 후 목록에 누적되는 동작은 DB-backed repository 또는 별도 in-memory store 단계에서 처리한다.
- 파일 업로드, 실제 알림 발송, 실제 감사 로그 저장은 아직 mock 처리 범위 밖이다.

## 남은 운영/관리 action 후보

- 사용자 상태 변경
- 역할/scope 할당 변경
- 시스템 설정 저장
- PWA 설정 저장
- 공지 발송 상태/읽음 집계 고도화

## 다음 전환 준비

- `SessionProvider` contract는 `mockSessionProvider` 기준선이 있다.
- `AppRepositories` contract는 핵심 학습 여정, 산출물, 평가, 운영, 공지 흐름을 포함한다.
- Supabase 전환 시 우선순위는 Auth provider, DB-backed repository, Storage 연결 순서가 자연스럽다.
- LMS/Keycloak/외부 DB 연동은 `docs/13-lms-db-integration-proposal.md`의 Future Integration Track으로 분리 유지한다.
