export type LmsSourceTablePurpose =
  | "identity"
  | "regular_catalog"
  | "regular_learning_record"
  | "subscription_catalog"
  | "subscription_learning_record"
  | "community_catalog"
  | "community_learning_record";

export type LmsSourceTableSpec = {
  tableName: string;
  purpose: LmsSourceTablePurpose[];
  keyColumns: string[];
  requiredViewColumns: string[];
  notes?: string;
};

export const lmsSourceTableSpecs: LmsSourceTableSpec[] = [
  {
    tableName: "회원",
    purpose: ["identity"],
    keyColumns: ["사용자 ID", "로그인 ID", "이메일"],
    requiredViewColumns: ["사용자 ID", "로그인 ID", "이메일", "성명", "전화번호", "과학기술인 번호"],
    notes: "Keycloak uuid/email/username claim과 PS Track users.external_subject 매핑 기준.",
  },
  {
    tableName: "회원소속",
    purpose: ["identity"],
    keyColumns: ["회원소속 ID", "회원 ID", "기관 ID"],
    requiredViewColumns: ["회원 ID", "기관 ID", "부서", "이메일", "직무분야", "대표소속기관 여부"],
  },
  {
    tableName: "등록_통계",
    purpose: ["regular_learning_record"],
    keyColumns: ["수강 ID", "신청자 ID", "차수 ID", "과정정보 과정 ID"],
    requiredViewColumns: [
      "수강 ID",
      "진도율",
      "수강 상태",
      "점수",
      "차수 ID",
      "차수 명",
      "수료 시간",
      "수료 번호",
      "학습자정보 학습자 ID",
      "학습자정보 로그인아이디",
      "학습자정보 이메일",
      "학습자정보 휴대전화",
      "과정정보 과정 ID",
      "과정정보 과정 명",
      "과정정보 과정유형",
    ],
    notes: "정규교육과정 학습/수료 실적 view의 우선 source. 수료 판단은 LMS 상태값 인용.",
  },
  {
    tableName: "수강_통계",
    purpose: ["regular_learning_record"],
    keyColumns: ["수강 ID", "신청자 ID", "차수 ID", "과정정보 과정 ID"],
    requiredViewColumns: [
      "수강 ID",
      "진도율",
      "수강 상태",
      "점수",
      "차수 ID",
      "차수 명",
      "수료 시간",
      "수료 번호",
      "학습자정보 학습자 ID",
      "학습자정보 로그인ID",
      "학습자정보 이메일",
      "학습자정보 휴대전화",
      "과정정보 과정 ID",
      "과정정보 과정 명",
      "과정정보 과정유형",
    ],
    notes: "등록_통계와 유사한 수강 실적 source. LMS 운영팀 view 제공 기준에 따라 둘 중 하나를 canonical로 선택.",
  },
  {
    tableName: "등록",
    purpose: ["regular_learning_record"],
    keyColumns: ["수강 신청 ID", "신청 사용자 ID", "차수 ID"],
    requiredViewColumns: [
      "수강 신청 ID",
      "상태_입과상태(승인2)",
      "신청 시간",
      "수강 시작일",
      "수강 종료일",
      "수료 시간",
      "수료번호",
      "수료정보 사용자 ID",
      "수료정보 사용자 명",
      "수료정보 과정 ID",
      "수료정보 과정 명",
      "수료정보 차수 ID",
      "수료정보 차수 명",
    ],
  },
  {
    tableName: "과목",
    purpose: ["regular_catalog"],
    keyColumns: ["과정 ID"],
    requiredViewColumns: ["과정 ID", "과정명", "과정 유형", "상태", "교육시간", "사용여부"],
  },
  {
    tableName: "시퀀스",
    purpose: ["regular_catalog"],
    keyColumns: ["차수 ID", "과정 ID"],
    requiredViewColumns: [
      "차수 ID",
      "과정 ID",
      "차수 명",
      "신청 시작 일시",
      "신청 종료 일시",
      "학습시작 일시",
      "학습종료일시",
      "차수 공개여부",
      "교육장소",
    ],
  },
  {
    tableName: "시퀀스_모듈",
    purpose: ["regular_catalog"],
    keyColumns: ["차수모듈 ID", "차수 ID"],
    requiredViewColumns: ["차수모듈 ID", "차수 ID", "차수모듈명", "차수모듈순번", "필수여부", "모듈유형"],
  },
  {
    tableName: "시퀀스_수업",
    purpose: ["regular_catalog"],
    keyColumns: ["차수차시 ID", "차수 ID", "차수 모듈 ID"],
    requiredViewColumns: [
      "차수차시 ID",
      "차수 ID",
      "차수 모듈 ID",
      "콘텐츠 풀 ID",
      "차수차시 순번",
      "차시유형",
      "필수여부",
      "시작 일시",
      "종료일시",
      "학습 시간",
    ],
  },
  {
    tableName: "콘텐츠_풀",
    purpose: ["regular_catalog", "subscription_catalog"],
    keyColumns: ["콘텐츠 풀 ID"],
    requiredViewColumns: ["콘텐츠 풀 ID", "콘텐츠풀 명", "콘텐츠 유형", "콘텐츠 코드", "재생시간(초)", "사용 여부"],
  },
  {
    tableName: "채널_콘텐츠",
    purpose: ["subscription_catalog"],
    keyColumns: ["채널 콘텐츠 ID", "채널 ID"],
    requiredViewColumns: ["채널 콘텐츠 ID", "채널 ID", "콘텐츠명", "상태", "채널 콘텐츠 Type", "수료기준", "learning_time"],
  },
  {
    tableName: "채널_학습",
    purpose: ["subscription_learning_record"],
    keyColumns: ["채널 학습 ID", "콘텐츠 ID", "학습자 ID"],
    requiredViewColumns: ["채널 학습 ID", "완료 여부", "완료 시간", "콘텐츠 ID", "콘텐츠 유형", "진도율", "학습자 ID", "학습시간"],
  },
  {
    tableName: "전자책_콘텐츠",
    purpose: ["subscription_catalog"],
    keyColumns: ["전자책 콘텐츠 ID", "상품번호 (13자리)"],
    requiredViewColumns: ["전자책 콘텐츠 ID", "상품번호 (13자리)", "콘텐츠명", "콘텐츠구분 (001:전자책, 002:오디오북)", "최대 인정시간", "중지여부 (사용 : N, 중지 : Y)"],
  },
  {
    tableName: "전자책_학습",
    purpose: ["subscription_learning_record"],
    keyColumns: ["전자책 학습 ID", "회원 ID", "상품번호 (13자리)"],
    requiredViewColumns: ["전자책 학습 ID", "상품번호 (13자리)", "수료여부 (Y:수료, N:미수료, P:학습중, B:재열람)", "회원 ID", "회원 로그인 ID", "학습시간 (분 단위)"],
  },
  {
    tableName: "학습_랩",
    purpose: ["community_catalog"],
    keyColumns: ["러닝랩 ID"],
    requiredViewColumns: ["러닝랩 ID", "상태 1:신청, 2:승인, 3:반려, 4:종료", "학습모임 타입", "시작일", "종료일", "이수시간"],
  },
  {
    tableName: "학습_랩_회원",
    purpose: ["community_learning_record"],
    keyColumns: ["학습모임 멤버 ID", "러닝랩 ID", "사용자 ID"],
    requiredViewColumns: ["학습모임 멤버 ID", "러닝랩 ID", "사용자 ID", "학습모임 맴버 상태", "학습모임 맴버 유형", "이수시간", "참여 여부"],
  },
];

export const syntheticLmsIds = {
  userId: "lms-user-synthetic-001",
  keycloakSubject: "keycloak-subject-synthetic-001",
  regularCourseId: "lms-course-synthetic-ps-track-2026",
  regularCourseRoundId: "lms-round-synthetic-ps-track-2026-01",
  regularEnrollmentId: "lms-enrollment-synthetic-001",
  contentPoolId: "lms-content-pool-synthetic-001",
  channelContentId: "lms-channel-content-synthetic-001",
  channelLearningId: "lms-channel-learning-synthetic-001",
  ebookContentId: "lms-ebook-content-synthetic-001",
  ebookLearningId: "lms-ebook-learning-synthetic-001",
  learningLabId: "lms-learning-lab-synthetic-001",
  learningLabMemberId: "lms-learning-lab-member-synthetic-001",
} as const;
