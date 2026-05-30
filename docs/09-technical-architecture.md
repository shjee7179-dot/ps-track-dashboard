# Technical Architecture Draft

## 권장 스택

1차 개발은 빠른 바이브코딩과 운영 가능성을 함께 고려해 다음 스택을 기본안으로 둔다.

| 영역 | 권장안 | 이유 |
| --- | --- | --- |
| Web App | Next.js App Router | 역할별 대시보드, 서버 액션, PWA 구성에 적합 |
| Language | TypeScript | 권한, 상태값, 데이터 모델 안정성 확보 |
| UI | Tailwind CSS + shadcn/ui + lucide-react | 빠른 구현, 일관된 운영형 UI, 모바일 대응 |
| Backend | Supabase | Auth, Postgres, Storage, RLS를 빠르게 구성 |
| Database | PostgreSQL | 객체 중심 관계 모델과 로그/리포트에 적합 |
| ORM | Drizzle 또는 Supabase Typed Client | 타입 안정성과 SQL 가시성 |
| Hosting | Vercel | Next.js 배포와 Preview에 적합 |
| PWA | next-pwa 또는 직접 manifest/service worker | 1차 PWA 기본 요건 충족 |

## 대안

Firebase도 가능하지만, 이 시스템은 관계형 객체, role+scope 권한, 산출물-평가-성과 연결이 많다. 따라서 1차 기본안은 Supabase/PostgreSQL이 더 자연스럽다.

## 앱 구조

```text
app/
├─ (auth)/
│  └─ login/
├─ (dashboard)/
│  ├─ dashboard/
│  ├─ cohorts/
│  ├─ journeys/
│  ├─ objects/
│  ├─ artifacts/
│  ├─ mentoring/
│  ├─ notices/
│  ├─ reports/
│  └─ admin/
├─ api/
├─ manifest.ts
└─ layout.tsx

components/
├─ layout/
├─ dashboards/
├─ cohorts/
├─ learning/
├─ artifacts/
├─ mentoring/
├─ admin/
└─ ui/

lib/
├─ auth/
├─ permissions/
├─ supabase/
├─ queries/
├─ validators/
└─ utils/

db/
├─ schema/
├─ migrations/
└─ seed/
```

## 권한 처리 구조

모든 주요 조회와 변경은 다음 순서로 처리한다.

```text
1. 현재 사용자 확인
2. role assignment 조회
3. 요청 대상 객체의 scope 계산
4. action 허용 여부 확인
5. 데이터 조회/변경
6. audit log 또는 activity log 기록
```

## 로그 전략

| 로그 | 목적 | 주요 사용자 |
| --- | --- | --- |
| ActivityLog | 학생/팀 학습 활동 추적 | 운영자, 멘토 |
| AuditLog | 시스템 변경 추적 | 총괄 관리자 |
| AccessLog | 로그인/접속 추적 | 총괄 관리자 |

## 파일 저장

산출물 파일은 Supabase Storage 또는 동등한 객체 스토리지에 저장한다. DB에는 파일 URL, 파일명, MIME type, 크기, 버전 정보를 저장한다.

## PWA 1차 범위

- `manifest.webmanifest` 또는 Next.js `manifest.ts`
- 앱명, short name, 아이콘, theme color
- 홈 화면 추가 가능 상태
- 로그인 세션 유지
- 주요 화면 모바일 레이아웃

1차에서 제외:

- Push notification
- Offline learning cache
- Background sync

## 검증 명령

실제 앱 생성 후 최소 검증 명령은 다음을 기준으로 한다.

```bash
npm run lint
npm run typecheck
npm run build
```

빌드 또는 런타임 실패가 발생하면 AGENTS.md의 진단 검증 순서를 따른다.
