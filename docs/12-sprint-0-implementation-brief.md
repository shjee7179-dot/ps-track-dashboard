# Sprint 0 Implementation Brief

## 목적

Sprint 0은 앱 개발의 첫 구현 단위다. 목표는 완성된 기능 앱이 아니라, 이후 화면을 안정적으로 얹을 수 있는 인증, 권한, 레이아웃, 로그, 설정, PWA 기반을 만드는 것이다.

## 권장 생성물

```text
ps-track-dashboard/
├─ app/
├─ components/
├─ lib/
├─ db/
├─ public/
├─ package.json
├─ tsconfig.json
├─ next.config.ts
└─ README.md
```

## 구현 순서

1. Next.js + TypeScript 앱 생성
2. Tailwind CSS와 shadcn/ui 구성
3. Supabase 클라이언트 구성
4. 기본 라우트 생성
5. 역할별 레이아웃과 사이드바 생성
6. 권한 + scope 유틸 구현
7. 2026년 기수 seed 데이터 추가
8. 감사 로그, 접속 로그, 시스템 설정, PWA 설정 화면 생성
9. 기본 manifest와 앱 아이콘 설정
10. lint, typecheck, production build 검증

## Sprint 0 P0 Routes

```text
/login
/dashboard
/admin/users
/admin/roles
/admin/audit-logs
/admin/access-logs
/admin/pwa
/admin/settings
```

## 초기 Seed Data

```text
Program
└─ R&D 커리어랩 펠로우십 - 미래 의사과학자 챌린지 트랙

Cohort
└─ 2026년 1기
   ├─ agreement_date: 2026-06
   ├─ starts_at: 2026-07-01
   └─ ends_at: 2026-10-31

Roles
├─ student
├─ operator
├─ mentor
├─ pi
└─ admin
```

## 첫 구현 프롬프트 초안

```text
Next.js App Router + TypeScript + Tailwind CSS 기반으로 ps-track-dashboard 앱을 생성한다.
미래 의사과학자 챌린지 트랙 학습 여정 대시보드의 Sprint 0 범위를 구현한다.

반드시 포함:
- /login
- /dashboard 역할별 분기
- 공통 운영형 레이아웃
- role + scope 기반 권한 유틸
- /admin/users
- /admin/roles
- /admin/audit-logs
- /admin/access-logs
- /admin/pwa
- /admin/settings
- 2026년 1기 seed 데이터
- 기본 PWA manifest

UI는 모바일 반응형이어야 하며, 운영형 대시보드 톤을 유지한다.
자체 채팅, 자체 화상회의, 자체 설문 빌더, push notification은 구현하지 않는다.
완료 후 lint, typecheck, production build를 실행한다.
```

## Definition of Done

- Sprint 0 라우트가 모두 접근 가능하다.
- 역할별 대시보드 분기 목업이 동작한다.
- scope 검사 유틸이 테스트 가능한 형태로 존재한다.
- 로그인/접속 이벤트를 기록할 구조가 존재한다.
- 설정 변경을 감사 로그로 남길 구조가 존재한다.
- PWA manifest가 유효하다.
- `npm run build`가 성공한다.
