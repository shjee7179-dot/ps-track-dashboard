# Future Integration Track: LMS DB 연동 (읽기 전용 뷰 2개) 통합 설계 및 구현 계획

> 현재 PS Track 독립형 MVP 본선에는 이 설계를 섞지 않는다.
>
> 이 문서는 LMS/Keycloak/DB 접근 환경이 실제로 준비된 뒤 별도 integration branch 또는 후속 버전에서 추진할 Future Integration Track이다. 현재 본선은 PS Track 자체 `learning_piece_statuses`, 산출물, 피드백, 평가, 성과, 리포트 흐름을 먼저 완수한다.

이 문서는 기존 LMS 데이터베이스로부터 요청할 2개의 읽기 전용 뷰(수료 테이블, 콘텐츠 조회 테이블)를 PS Track 대시보드 시스템과 어떻게 안전하고 유기적으로 연동할 것인지에 대한 설계 및 기술 구현 계획을 담고 있습니다.

---

## 1. 연동 아키텍처 및 보안 설계

기존 LMS와 PS Track이 동일한 NHN 공공클라우드 내의 VPC 공간에 위치하므로, 복잡한 API 개발 없이 데이터베이스 수준에서 안전하게 연동할 수 있습니다.

### 인프라 구성도 (VPC 내부 연동)
```text
[ VPC Public Zone ]
┌──────────────────────────────┐
│  PS Track Web/WAS (Next.js)  │
└──────────────┬───────────────┘
               │ (Private PG Connection)
[ VPC Private Zone ]
┌──────────────▼───────────────┐        ┌─────────────────────────┐
│     PS Track PostgreSQL      │ ◄───── │   기존 LMS PostgreSQL    │
│  (자체 운영 데이터 저장)      │        │  (수료 & 콘텐츠 진도)    │
│                              │  FDW   └─────────────────────────┘
│  ├─ v_lms_completions        │ (Read-Only)
│  └─ v_lms_content_access     │
└──────────────────────────────┘
```

### 연동 방식 제안 (운영팀 요청용)
1. **PostgreSQL Foreign Data Wrapper (FDW)**:
   - **설명**: PS Track 데이터베이스에서 LMS 데이터베이스의 특정 테이블/뷰를 마치 자신의 로컬 테이블처럼 조회할 수 있게 연결하는 PG 표준 기능입니다.
   - **장점**: 별도의 데이터 동기화 배치 프로그램이 필요 없고, 실시간으로 최신 수료/진도 정보가 조회됩니다.
   - **권한 제약**: LMS 운영팀에서 **수료 정보**와 **콘텐츠 조회 정보**에 대해 **특정 IP(PS Track DB 인스턴스)에서의 SELECT 권한만 허용한 전용 DB 계정**을 발급해주면 됩니다.
2. **다중 DB 커넥션 (Next.js WAS 직접 연결)**:
   - FDW 권한 획득이 어려울 경우, Next.js 백엔드 서버(WAS)에서 LMS DB용 읽기 전용 계정 커넥션을 따로 맺어 직접 조회하는 대안입니다.

---

## 2. 데이터 연계 및 사용자 매핑 설계

### 🔑 Keycloak 기반 자연 키 (Natural Key) 매핑
Keycloak을 공통 인증 수단으로 사용하므로, 별도의 복잡한 매핑 테이블이 필요하지 않습니다.
- **Keycloak User ID (`sub` UUID)** 또는 **로그인 아이디 (`username`, 예: 학번/사번)**가 기존 LMS와 PS Track에서 정확히 일치합니다.
- DB 스키마 상의 `users.id` (또는 `users.lms_user_id`)를 기준으로 조인(Join)하여 수료/진도를 판정합니다.

### 📊 읽기 전용 뷰 스키마 정의 (LMS 운영팀 요청 규격)

#### ① 수료 테이블 뷰 (`v_lms_completions`)
학생이 특정 과정을 최종 수료했는지 여부를 조회합니다.

| 컬럼명 | 타입 | 설명 | 예시 |
| --- | --- | --- | --- |
| `student_id` | uuid 또는 text | Keycloak ID 또는 로그인 ID | `usr_9a8b7c6d...` |
| `course_id` | text | LMS 과정 ID / 코드 | `COU-2026-MED01` |
| `is_completed` | boolean | 수료 여부 (True/False) | `true` |
| `completed_at` | timestamptz | 최종 수료 처리 시각 | `2026-07-15 14:00:00+09` |

#### ② 콘텐츠 조회 테이블 뷰 (`v_lms_content_access`)
학생이 개별 콘텐츠(온라인 강의 영상 시청, 자료 조회 등)를 완료했는지 상세 진도를 조회합니다.

| 컬럼명 | 타입 | 설명 | 예시 |
| --- | --- | --- | --- |
| `student_id` | uuid 또는 text | Keycloak ID 또는 로그인 ID | `usr_9a8b7c6d...` |
| `course_id` | text | LMS 과정 ID / 코드 | `COU-2026-MED01` |
| `content_id` | text | LMS 콘텐츠 ID (영상/자료 개별 키) | `CON-VIDEO-045` |
| `progress_ratio` | numeric | 진도율 (%) | `85.5` |
| `is_completed` | boolean | 콘텐츠 완료 여부 (LMS 기준 충족 시 true) | `true` |
| `last_accessed_at`| timestamptz | 마지막 학습 시각 | `2026-07-02 18:30:00+09` |

---

## 3. PS Track 자체 데이터 모델 확장

LMS 뷰에서 가져온 실시간 수료/진도 정보를 PS Track의 학습피스(`learning_pieces`) 완료 여부와 연동하기 위해, 자체 DB 스키마에 아래 매핑 컬럼을 추가합니다.

### [MODIFY] `learning_pieces` 테이블 확장
기존 스키마에 LMS 연동용 nullable 컬럼 2개를 추가합니다.

```sql
ALTER TABLE learning_pieces ADD COLUMN lms_course_id text NULL;
ALTER TABLE learning_pieces ADD COLUMN lms_content_id text NULL;
```

- **시나리오 A (과정 수료 연동)**: 
  - 특정 학습피스의 `piece_type`이 `'survey'` 또는 `'final_artifact'`이고, LMS 과정 전체 수료와 연동하고 싶다면 `lms_course_id = 'COU-2026-MED01'`만 채웁니다.
- **시나리오 B (개별 영상/자료 완료 연동)**:
  - 특정 학습피스의 `piece_type`이 `'video'` 또는 `'reading'`이고, 개별 동영상 수강 여부와 연동하고 싶다면 `lms_content_id = 'CON-VIDEO-045'`를 채웁니다.

---

## 4. 구현 및 리팩토링 계획

### Step 1: `src/lib/repository-contracts.ts` 계약 확장
LMS 연동 데이터를 확인하는 인터페이스를 추가 정의합니다.

```typescript
export interface ILmsIntegrationRepository {
  // 특정 학생의 특정 과정 수료 여부 조회
  getCourseCompletion(studentId: string, courseId: string): Promise<boolean>;
  
  // 특정 학생의 특정 콘텐츠 완료 여부 및 진도율 조회
  getContentAccess(studentId: string, contentId: string): Promise<{
    isCompleted: boolean;
    progressRatio: number;
    lastAccessedAt: Date | null;
  } | null>;
}
```

### Step 2: `src/lib/mock-data.ts` 및 Mock Repository 보강
실제 DB 연결 전, Mock 데이터 수준에서도 LMS 연동 정보가 반영된 여정이 렌더링되도록 구현합니다.
- Mock 데이터에 `lms_course_id` 및 `lms_content_id` 속성 추가.
- `src/lib/journeys.ts`의 `getStudentJourney` 함수에서, LMS 매핑 컬럼이 지정되어 있는 학습피스는 기존 `learning_piece_statuses` 데이터 대신 **LMS Mock 데이터 상태를 우선 조회하여 완료 여부(`완료` / `진행 중`)를 결정**하도록 분기 처리합니다.

### Step 3: Drizzle 스키마 정의 및 PostgreSQL/FDW 전환
- Drizzle Schema 파일에 `v_lms_completions`, `v_lms_content_access` 읽기 전용 뷰 스키마를 선언합니다 (`pgView` 활용).
- FDW 또는 Read-only 연결을 설정하여, 로컬 mock 함수들을 실제 Drizzle 쿼리로 전환합니다.

---

## 5. 검증 계획

### 1단계: Mock 통합 검증 (로컬)
- [ ] `src/lib/mock-data.ts`에 LMS 가상 완료 데이터 셋업
- [ ] 특정 학생의 학습피스 상태가 LMS 가상 데이터에 맞춰 자동으로 `완료` 상태로 대시보드에 노출되는지 확인
- [ ] `npm run lint` 및 `npm run typecheck` 통과 여부 검증

### 2단계: 실제 환경 스테이징 검증 (NHN Cloud 환경)
- [ ] VPC 내 PS Track DB에서 LMS DB 읽기 전용 계정 커넥션 테스트
- [ ] FDW 또는 직접 뷰 조회를 통해 수료/콘텐츠 진도 조인이 원활한지 속도 및 권한 점검
- [ ] Keycloak 로그인 정보와 LMS 유저 ID 연동 무결성 최종 검증

---

## 6. 사용자 리뷰 및 확인이 필요한 사항

> [!IMPORTANT]
> **LMS 운영팀에 인프라 및 DB 협조를 요청할 때 아래 핵심 항목을 포함해 작성하시면 원활하게 승인받을 수 있습니다.**
>
> 1. **보안성 심의 지원**: "LMS 실 서버 DB를 직접 수정하는 쓰기(Write) 권한은 일절 배제하며, 오직 **특정 IP(PS Track WAS/DB)만 접근 가능한 읽기 전용(Read-Only) SELECT 권한**만 요청함. 회원 개인정보(전화번호, 주민번호 등)는 포함하지 않으며, 오직 학번/사번 수준의 매핑 ID와 수료 여부/수강 진도율 수치만 조회하므로 개인정보 유출 위험이 원천 차단됨."
> 2. **Keycloak Client ID 추가**: PS Track 전용 테넌트 혹은 클라이언트를 Keycloak에 등록해줄 것을 병행 요청함.
