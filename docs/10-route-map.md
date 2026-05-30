# Route Map

## P0 Routes

| Route | 화면 | 주요 역할 |
| --- | --- | --- |
| `/login` | 로그인 / 역할 선택 | 전체 |
| `/dashboard` | 역할별 홈 | 전체 |
| `/cohorts/2026` | 2026년 기수 대시보드 | 운영자, PI, 총괄 |
| `/cohorts/2026/detail` | 기수 상세 | 운영자, 총괄 |
| `/cohorts/2026/participants` | 참여자 목록 | 운영자, 총괄 |
| `/cohorts/2026/students/:studentId` | 학생 상세 | 운영자, 멘토, PI |
| `/cohorts/2026/teams` | 팀 목록 | 운영자, 멘토 |
| `/cohorts/2026/teams/:teamId` | 팀 상세 | 운영자, 멘토 |
| `/cohorts/2026/mentor-assignments` | 멘토 배정 | 운영자 |
| `/objects/modules` | 모듈 목록 | 운영자, 총괄 |
| `/objects/modules/:moduleId` | 모듈 상세 | 운영자, 총괄 |
| `/objects/contents` | 콘텐츠 목록 | 운영자, 총괄 |
| `/objects/contents/:contentId` | 콘텐츠 상세 | 운영자, 총괄 |
| `/objects/learning-pieces` | 학습피스 목록 | 전체 권한별 |
| `/objects/learning-pieces/:learningPieceId` | 학습피스 상세 | 전체 권한별 |
| `/journeys/students` | 학생별 학습 여정 | 운영자, 멘토, PI |
| `/journeys/students/:studentId` | 학생 여정 상세 | 운영자, 멘토, PI |
| `/journeys/status` | 학습피스 상태 관리 | 운영자, 멘토 |
| `/artifacts` | 산출물 목록 | 전체 권한별 |
| `/artifacts/:artifactId` | 산출물 상세 / 제출 | 전체 권한별 |
| `/artifacts/:artifactId/review` | 산출물 리뷰 | 멘토, PI |
| `/artifacts/:artifactId/evaluation` | 루브릭 평가 | 멘토, PI |
| `/mentoring/sessions` | 멘토링 일정 | 학생, 멘토, 운영자 |
| `/mentoring/sessions/:sessionId` | 멘토링 기록 | 멘토, 운영자 |
| `/operations/risks` | 위험군 / 리마인드 추천 | 운영자 |
| `/notices` | 공지사항 목록 | 전체 |
| `/notices/new` | 공지사항 작성 | 운영자 |
| `/admin/users` | 사용자 관리 | 총괄 |
| `/admin/roles` | 역할 / 접근 범위 관리 | 총괄 |
| `/admin/audit-logs` | 감사 로그 | 총괄 |
| `/admin/access-logs` | 접속 로그 | 총괄 |
| `/admin/pwa` | PWA 설정 화면 | 총괄 |
| `/admin/settings` | 전체 시스템 설정 | 총괄 |

## 역할별 `/dashboard` 분기

```text
학생참여자 → 학생 대시보드
멘토 → 담당 학생/팀 대시보드
프로그램운영자 → 2026년 기수 운영 대시보드
PI / 연구책임자 → 성과 및 품질 대시보드
시스템 총괄 관리자 → 시스템 운영 대시보드
```

## P1 Routes

| Route | 화면 |
| --- | --- |
| `/templates/programs` | 프로그램 템플릿 관리 |
| `/templates/schedules` | 상대 일정 템플릿 관리 |
| `/outcomes` | 학습성과 목록 |
| `/outcomes/:outcomeId` | 학습성과 상세 |
| `/surveys` | 설문 링크 관리 |
| `/surveys/responses` | 설문 응답 여부 |
| `/reports/progress` | 참여율 / 완료율 리포트 |
| `/reports/artifacts` | 산출물 현황 리포트 |
| `/exports` | CSV 내보내기 |
