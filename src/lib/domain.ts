export type Role = "student" | "operator" | "mentor" | "pi" | "admin";

export type ScopeType =
  | "system"
  | "program"
  | "cohort"
  | "track"
  | "team"
  | "student";

export type Action = "read" | "create" | "update" | "delete" | "manage";

export type RoleAssignment = {
  id: string;
  userId: string;
  role: Role;
  scopeType: ScopeType;
  scopeId: string;
  status: "active" | "inactive";
};

export type User = {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  defaultRole: Role;
  status: "active" | "inactive";
};

export type Cohort = {
  id: string;
  name: string;
  agreementDate: string;
  startsAt: string;
  endsAt: string;
  status: "draft" | "active" | "closed";
};

export type LogEvent = {
  id: string;
  actor: string;
  event: string;
  target: string;
  occurredAt: string;
  severity: "info" | "notice" | "warning";
};

export type LearningPieceStatus =
  | "locked"
  | "not_started"
  | "in_progress"
  | "needs_submission"
  | "pending_review"
  | "revising"
  | "pending_evaluation"
  | "completed"
  | "delayed";

export type Module = {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  status: "draft" | "open" | "closed";
};

export type Content = {
  id: string;
  moduleId: string;
  title: string;
  contentType:
    | "video"
    | "reading"
    | "workshop"
    | "assignment"
    | "practice"
    | "link"
    | "offline"
    | "mentoring_guide";
};

export type LearningPiece = {
  id: string;
  moduleId: string;
  contentId?: string;
  title: string;
  pieceType:
    | "reading"
    | "video"
    | "workshop"
    | "assignment"
    | "mentoring"
    | "practice"
    | "mid_artifact"
    | "final_artifact"
    | "survey";
  completionRule: string;
  opensAt: string;
  dueAt: string;
  requiresSubmission: boolean;
  requiresApproval: boolean;
  requiresEvaluation: boolean;
  outcomeTags: string[];
};

export type StudentLearningPieceStatus = {
  id: string;
  studentId: string;
  learningPieceId: string;
  status: LearningPieceStatus;
  updatedAt: string;
  completedAt?: string;
  note?: string;
};

export type ActivityLog = {
  id: string;
  studentId: string;
  eventType: string;
  target: string;
  occurredAt: string;
  detail: string;
};

export const cohort2026: Cohort = {
  id: "cohort-2026-1",
  name: "2026년 1기",
  agreementDate: "2026-06",
  startsAt: "2026-07-01",
  endsAt: "2026-10-31",
  status: "draft",
};

export const users: User[] = [
  {
    id: "student-001",
    name: "김서연",
    email: "student@example.kr",
    affiliation: "예비 의사과학자",
    defaultRole: "student",
    status: "active",
  },
  {
    id: "operator-001",
    name: "운영자",
    email: "operator@example.kr",
    affiliation: "프로그램 운영팀",
    defaultRole: "operator",
    status: "active",
  },
  {
    id: "mentor-001",
    name: "이멘토",
    email: "mentor@example.kr",
    affiliation: "연구 멘토단",
    defaultRole: "mentor",
    status: "active",
  },
  {
    id: "pi-001",
    name: "박책임",
    email: "pi@example.kr",
    affiliation: "연구책임자",
    defaultRole: "pi",
    status: "active",
  },
  {
    id: "admin-001",
    name: "시스템 총괄",
    email: "admin@example.kr",
    affiliation: "시스템 관리",
    defaultRole: "admin",
    status: "active",
  },
];

export const roleAssignments: RoleAssignment[] = [
  {
    id: "ra-001",
    userId: "student-001",
    role: "student",
    scopeType: "student",
    scopeId: "student-001",
    status: "active",
  },
  {
    id: "ra-002",
    userId: "operator-001",
    role: "operator",
    scopeType: "cohort",
    scopeId: cohort2026.id,
    status: "active",
  },
  {
    id: "ra-003",
    userId: "mentor-001",
    role: "mentor",
    scopeType: "team",
    scopeId: "team-001",
    status: "active",
  },
  {
    id: "ra-004",
    userId: "pi-001",
    role: "pi",
    scopeType: "program",
    scopeId: "program-ps-track",
    status: "active",
  },
  {
    id: "ra-005",
    userId: "admin-001",
    role: "admin",
    scopeType: "system",
    scopeId: "system",
    status: "active",
  },
];

export const modules: Module[] = [
  {
    id: "module-001",
    title: "오리엔테이션과 연구 여정 설계",
    description: "프로그램 구조를 이해하고 개인 연구 관심사를 정리한다.",
    orderIndex: 1,
    status: "open",
  },
  {
    id: "module-002",
    title: "의사과학자 연구 기초",
    description: "문제 정의, 연구 질문, 문헌 탐색의 기초를 학습한다.",
    orderIndex: 2,
    status: "open",
  },
  {
    id: "module-003",
    title: "중간 산출물 작성",
    description: "연구계획서 초안을 작성하고 멘토 피드백을 반영한다.",
    orderIndex: 3,
    status: "draft",
  },
];

export const contents: Content[] = [
  {
    id: "content-001",
    moduleId: "module-001",
    title: "챌린지 트랙 오리엔테이션",
    contentType: "workshop",
  },
  {
    id: "content-002",
    moduleId: "module-001",
    title: "나의 연구 관심사 진단",
    contentType: "assignment",
  },
  {
    id: "content-003",
    moduleId: "module-002",
    title: "연구 질문을 만드는 방법",
    contentType: "video",
  },
  {
    id: "content-004",
    moduleId: "module-002",
    title: "문헌 탐색 실습",
    contentType: "practice",
  },
  {
    id: "content-005",
    moduleId: "module-003",
    title: "연구계획서 초안 가이드",
    contentType: "assignment",
  },
];

export const learningPieces: LearningPiece[] = [
  {
    id: "lp-001",
    moduleId: "module-001",
    contentId: "content-001",
    title: "오리엔테이션 참석 확인",
    pieceType: "workshop",
    completionRule: "운영자가 참석 여부를 확인하면 완료",
    opensAt: "2026-07-01",
    dueAt: "2026-07-03",
    requiresSubmission: false,
    requiresApproval: true,
    requiresEvaluation: false,
    outcomeTags: ["프로그램 이해", "학습 계획"],
  },
  {
    id: "lp-002",
    moduleId: "module-001",
    contentId: "content-002",
    title: "연구 관심사 자기소개 제출",
    pieceType: "assignment",
    completionRule: "학생이 자기소개와 관심 주제를 제출하면 완료",
    opensAt: "2026-07-01",
    dueAt: "2026-07-08",
    requiresSubmission: true,
    requiresApproval: false,
    requiresEvaluation: false,
    outcomeTags: ["진로탐색", "문제 인식"],
  },
  {
    id: "lp-003",
    moduleId: "module-002",
    contentId: "content-003",
    title: "연구 질문 강의 시청",
    pieceType: "video",
    completionRule: "영상 시청 완료 체크",
    opensAt: "2026-07-09",
    dueAt: "2026-07-15",
    requiresSubmission: false,
    requiresApproval: false,
    requiresEvaluation: false,
    outcomeTags: ["연구 이해", "문제 정의"],
  },
  {
    id: "lp-004",
    moduleId: "module-002",
    contentId: "content-004",
    title: "핵심 논문 3편 탐색 기록",
    pieceType: "practice",
    completionRule: "문헌 탐색 기록을 제출하면 완료",
    opensAt: "2026-07-16",
    dueAt: "2026-07-24",
    requiresSubmission: true,
    requiresApproval: false,
    requiresEvaluation: false,
    outcomeTags: ["문헌 탐색", "데이터 해석"],
  },
  {
    id: "lp-005",
    moduleId: "module-003",
    contentId: "content-005",
    title: "연구계획서 초안 제출",
    pieceType: "mid_artifact",
    completionRule: "초안 제출 후 멘토 피드백을 받으면 완료",
    opensAt: "2026-08-01",
    dueAt: "2026-08-12",
    requiresSubmission: true,
    requiresApproval: true,
    requiresEvaluation: false,
    outcomeTags: ["연구 설계", "과학 커뮤니케이션"],
  },
];

export const studentLearningPieceStatuses: StudentLearningPieceStatus[] = [
  {
    id: "slps-001",
    studentId: "student-001",
    learningPieceId: "lp-001",
    status: "completed",
    updatedAt: "2026-07-02",
    completedAt: "2026-07-02",
    note: "오리엔테이션 참석 확인 완료",
  },
  {
    id: "slps-002",
    studentId: "student-001",
    learningPieceId: "lp-002",
    status: "pending_review",
    updatedAt: "2026-07-07",
    note: "관심 주제 제출 완료, 운영 확인 대기",
  },
  {
    id: "slps-003",
    studentId: "student-001",
    learningPieceId: "lp-003",
    status: "in_progress",
    updatedAt: "2026-07-10",
    note: "영상 60% 시청",
  },
  {
    id: "slps-004",
    studentId: "student-001",
    learningPieceId: "lp-004",
    status: "not_started",
    updatedAt: "2026-07-10",
  },
  {
    id: "slps-005",
    studentId: "student-001",
    learningPieceId: "lp-005",
    status: "locked",
    updatedAt: "2026-07-10",
  },
];

export const activityLogs: ActivityLog[] = [
  {
    id: "activity-001",
    studentId: "student-001",
    eventType: "learning_piece_completed",
    target: "오리엔테이션 참석 확인",
    occurredAt: "2026-07-02 15:20",
    detail: "운영자 확인으로 완료 처리",
  },
  {
    id: "activity-002",
    studentId: "student-001",
    eventType: "submission_created",
    target: "연구 관심사 자기소개 제출",
    occurredAt: "2026-07-07 21:10",
    detail: "자기소개와 관심 주제 제출",
  },
  {
    id: "activity-003",
    studentId: "student-001",
    eventType: "content_viewed",
    target: "연구 질문을 만드는 방법",
    occurredAt: "2026-07-10 19:40",
    detail: "콘텐츠 열람 시작",
  },
];

export const auditLogs: LogEvent[] = [
  {
    id: "audit-001",
    actor: "시스템 총괄",
    event: "PWA 설정 초안 생성",
    target: "pwa_settings",
    occurredAt: "2026-05-31 01:20",
    severity: "info",
  },
  {
    id: "audit-002",
    actor: "운영자",
    event: "2026년 1기 seed 데이터 확인",
    target: cohort2026.name,
    occurredAt: "2026-05-31 01:18",
    severity: "notice",
  },
];

export const accessLogs: LogEvent[] = [
  {
    id: "access-001",
    actor: "시스템 총괄",
    event: "로그인",
    target: "admin dashboard",
    occurredAt: "2026-05-31 01:16",
    severity: "info",
  },
  {
    id: "access-002",
    actor: "운영자",
    event: "역할 선택",
    target: "operator / cohort-2026-1",
    occurredAt: "2026-05-31 01:17",
    severity: "info",
  },
];

export function canAccess(
  assignment: RoleAssignment,
  action: Action,
  targetScopeType: ScopeType,
  targetScopeId: string,
) {
  if (assignment.status !== "active") return false;
  if (assignment.role === "admin" && assignment.scopeType === "system") {
    return true;
  }
  if (action === "delete" && assignment.role !== "admin") return false;
  if (assignment.scopeType === targetScopeType && assignment.scopeId === targetScopeId) {
    return true;
  }
  if (assignment.role === "operator" && targetScopeType !== "system") {
    return assignment.scopeType === "cohort";
  }
  if (assignment.role === "pi" && action === "read") {
    return ["program", "cohort", "team", "student"].includes(targetScopeType);
  }
  return false;
}

export function getDefaultAssignment(role: Role) {
  return roleAssignments.find((assignment) => assignment.role === role) ?? roleAssignments[0];
}

export const pwaSettings = {
  appName: "PS Track Dashboard",
  shortName: "PS Track",
  themeColor: "#0f766e",
  display: "standalone",
  installable: true,
};

export const systemSettings = [
  { key: "default_cohort", label: "기본 기수", value: cohort2026.name },
  { key: "reminder_mode", label: "리마인드 방식", value: "자동 추천 + 수동 발송" },
  { key: "survey_mode", label: "설문 방식", value: "외부 설문 링크 + 응답 여부 추적" },
  { key: "mobile_priority", label: "모바일 최적화", value: "학생 대시보드 우선" },
];

export function getStudentById(studentId: string) {
  return users.find((user) => user.id === studentId && user.defaultRole === "student");
}

export function getLearningPieceById(learningPieceId: string) {
  return learningPieces.find((piece) => piece.id === learningPieceId);
}

export function getModuleById(moduleId: string) {
  return modules.find((module) => module.id === moduleId);
}

export function getContentById(contentId?: string) {
  return contents.find((content) => content.id === contentId);
}

export function getStudentJourney(studentId: string) {
  return studentLearningPieceStatuses
    .filter((status) => status.studentId === studentId)
    .map((status) => ({
      status,
      learningPiece: getLearningPieceById(status.learningPieceId),
    }))
    .filter((item): item is { status: StudentLearningPieceStatus; learningPiece: LearningPiece } =>
      Boolean(item.learningPiece),
    );
}

export function getJourneySummary(studentId: string) {
  const journey = getStudentJourney(studentId);
  const completed = journey.filter((item) => item.status.status === "completed").length;
  const delayed = journey.filter((item) => item.status.status === "delayed").length;
  const needsAction = journey.filter((item) =>
    ["needs_submission", "pending_review", "revising", "in_progress"].includes(item.status.status),
  ).length;

  return {
    total: journey.length,
    completed,
    delayed,
    needsAction,
    completionRate: journey.length ? Math.round((completed / journey.length) * 100) : 0,
  };
}

export function getStatusLabel(status: LearningPieceStatus) {
  const labels: Record<LearningPieceStatus, string> = {
    locked: "미공개",
    not_started: "진행 전",
    in_progress: "진행 중",
    needs_submission: "제출 필요",
    pending_review: "확인 대기",
    revising: "피드백 반영 중",
    pending_evaluation: "평가 대기",
    completed: "완료",
    delayed: "지연",
  };

  return labels[status];
}
