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

export type Team = {
  id: string;
  cohortId: string;
  name: string;
  topic: string;
  mentorId: string;
  memberIds: string[];
  status: "forming" | "active" | "closed";
};

export type ArtifactStatus =
  | "not_started"
  | "drafting"
  | "submitted"
  | "in_review"
  | "revision_requested"
  | "pending_evaluation"
  | "evaluated"
  | "final_confirmed";

export type Artifact = {
  id: string;
  cohortId: string;
  artifactType: "profile" | "literature_log" | "research_plan" | "presentation" | "final_report";
  title: string;
  ownerType: "student" | "team";
  ownerId: string;
  learningPieceId?: string;
  status: ArtifactStatus;
  dueAt: string;
  finalConfirmed: boolean;
  outcomeTags: string[];
};

export type Submission = {
  id: string;
  artifactId: string;
  submittedBy: string;
  version: number;
  submittedAt: string;
  fileName?: string;
  externalUrl?: string;
  note: string;
};

export type Feedback = {
  id: string;
  artifactId?: string;
  mentoringSessionId?: string;
  authorId: string;
  targetUserId?: string;
  targetTeamId?: string;
  body: string;
  status: "open" | "resolved";
  createdAt: string;
};

export type MentoringSession = {
  id: string;
  cohortId: string;
  targetType: "student" | "team";
  targetId: string;
  mentorId: string;
  scheduledAt: string;
  status: "scheduled" | "completed" | "absent" | "cancelled";
  externalMeetingUrl?: string;
  notes: string;
  linkedArtifactId?: string;
  nextActions: string[];
};

export type RiskSignal = {
  id: string;
  cohortId: string;
  targetType: "student" | "team";
  targetId: string;
  riskType: "learning_piece_delay" | "artifact_missing" | "mentoring_issue";
  severity: "low" | "medium" | "high";
  relatedObjectType: "learning_piece" | "artifact" | "mentoring_session";
  relatedObjectId: string;
  actionStatus: "open" | "in_progress" | "resolved";
  actionNote: string;
};

export type ReminderCandidate = {
  id: string;
  riskSignalId: string;
  targetType: "student" | "team";
  targetId: string;
  reason: string;
  channel: "email" | "sms" | "kakao" | "manual";
  sendStatus: "pending" | "sent" | "skipped";
  recommendedAt: string;
  sentAt?: string;
};

export type Notice = {
  id: string;
  cohortId: string;
  title: string;
  body: string;
  targetScopeType: ScopeType;
  targetScopeId: string;
  publishedAt: string;
  createdBy: string;
  readCount: number;
};

export type LearningOutcome = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: "research_foundation" | "research_design" | "communication" | "career";
};

export type Rubric = {
  id: string;
  artifactType: Artifact["artifactType"];
  title: string;
  maxScore: number;
  status: "draft" | "active" | "archived";
};

export type RubricItem = {
  id: string;
  rubricId: string;
  title: string;
  description: string;
  maxScore: number;
  outcomeIds: string[];
};

export type Evaluation = {
  id: string;
  artifactId: string;
  rubricId: string;
  evaluatorId: string;
  evaluatedAt: string;
  totalScore: number;
  maxScore: number;
  overallComment: string;
  status: "draft" | "submitted";
};

export type EvaluationItemScore = {
  id: string;
  evaluationId: string;
  rubricItemId: string;
  score: number;
  comment: string;
};

export type OutcomeEvidence = {
  id: string;
  outcomeId: string;
  studentId: string;
  sourceType: "learning_piece" | "artifact" | "evaluation" | "feedback";
  sourceId: string;
  evidenceLabel: string;
  recordedAt: string;
};

export type ProgramTemplate = {
  id: string;
  title: string;
  version: string;
  cloneableObjectTypes: Array<"module" | "content" | "learning_piece" | "rubric" | "learning_outcome" | "schedule_template">;
  excludedObjectTypes: Array<"participant" | "team_assignment" | "submission" | "feedback" | "evaluation">;
};

export type ScheduleTemplate = {
  id: string;
  templateId: string;
  objectType: "module" | "content" | "learning_piece" | "survey";
  objectId: string;
  relativeStartDay: number;
  relativeDueDay: number;
};

export type Survey = {
  id: string;
  cohortId: string;
  title: string;
  surveyType: "pre" | "post" | "pulse";
  externalUrl: string;
  targetScopeType: ScopeType;
  targetScopeId: string;
  dueAt: string;
  linkedOutcomeIds: string[];
};

export type SurveyResponse = {
  id: string;
  surveyId: string;
  respondentId: string;
  responseStatus: "not_sent" | "sent" | "responded";
  respondedAt?: string;
};

export type ReportExport = {
  id: string;
  reportType: "participation" | "artifact_status" | "outcome_summary";
  title: string;
  format: "csv";
  generatedAt: string;
  rowCount: number;
};

export type PwaQualityCheck = {
  id: string;
  label: string;
  status: "pass" | "warning" | "fail";
  detail: string;
};

export type RouteAccessPolicy = {
  href: string;
  label: string;
  roles: Role[];
  targetScopeType: ScopeType;
  targetScopeId: string;
  navGroup: "core" | "learning" | "operations" | "admin";
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

export const teams: Team[] = [
  {
    id: "team-001",
    cohortId: cohort2026.id,
    name: "바이오메디컬 질문 설계팀",
    topic: "청소년 의사과학자 관점의 임상 연구 질문 설계",
    mentorId: "mentor-001",
    memberIds: ["student-001"],
    status: "active",
  },
];

export const artifacts: Artifact[] = [
  {
    id: "artifact-001",
    cohortId: cohort2026.id,
    artifactType: "profile",
    title: "연구 관심사 자기소개",
    ownerType: "student",
    ownerId: "student-001",
    learningPieceId: "lp-002",
    status: "submitted",
    dueAt: "2026-07-08",
    finalConfirmed: false,
    outcomeTags: ["진로탐색", "문제 인식"],
  },
  {
    id: "artifact-002",
    cohortId: cohort2026.id,
    artifactType: "literature_log",
    title: "핵심 논문 3편 탐색 기록",
    ownerType: "student",
    ownerId: "student-001",
    learningPieceId: "lp-004",
    status: "drafting",
    dueAt: "2026-07-24",
    finalConfirmed: false,
    outcomeTags: ["문헌 탐색", "데이터 해석"],
  },
  {
    id: "artifact-003",
    cohortId: cohort2026.id,
    artifactType: "research_plan",
    title: "팀 연구계획서 초안",
    ownerType: "team",
    ownerId: "team-001",
    learningPieceId: "lp-005",
    status: "in_review",
    dueAt: "2026-08-12",
    finalConfirmed: false,
    outcomeTags: ["연구 설계", "과학 커뮤니케이션"],
  },
];

export const submissions: Submission[] = [
  {
    id: "submission-001",
    artifactId: "artifact-001",
    submittedBy: "student-001",
    version: 1,
    submittedAt: "2026-07-07 21:10",
    externalUrl: "https://example.com/submissions/research-interest",
    note: "관심 연구 분야와 자기소개 제출",
  },
  {
    id: "submission-002",
    artifactId: "artifact-003",
    submittedBy: "student-001",
    version: 1,
    submittedAt: "2026-08-09 20:40",
    fileName: "research-plan-v1.pdf",
    note: "팀 연구계획서 1차 초안",
  },
];

export const mentoringSessions: MentoringSession[] = [
  {
    id: "mentoring-001",
    cohortId: cohort2026.id,
    targetType: "student",
    targetId: "student-001",
    mentorId: "mentor-001",
    scheduledAt: "2026-07-18 19:00",
    status: "scheduled",
    externalMeetingUrl: "https://meet.example.com/ps-track-mentoring-001",
    notes: "연구 관심사와 문헌 탐색 방향을 점검할 예정",
    linkedArtifactId: "artifact-001",
    nextActions: ["관심 주제를 연구 질문 형태로 다시 작성", "문헌 탐색 키워드 5개 정리"],
  },
  {
    id: "mentoring-002",
    cohortId: cohort2026.id,
    targetType: "team",
    targetId: "team-001",
    mentorId: "mentor-001",
    scheduledAt: "2026-08-10 20:00",
    status: "completed",
    externalMeetingUrl: "https://meet.example.com/ps-track-mentoring-002",
    notes: "연구계획서 초안의 연구 질문 범위를 좁히도록 피드백",
    linkedArtifactId: "artifact-003",
    nextActions: ["연구 대상 정의 보완", "방법론 섹션에 변수 정의 추가"],
  },
];

export const feedback: Feedback[] = [
  {
    id: "feedback-001",
    artifactId: "artifact-001",
    mentoringSessionId: "mentoring-001",
    authorId: "mentor-001",
    targetUserId: "student-001",
    body: "관심 주제는 좋지만 임상 문제와 연구 질문을 더 분리해서 써보면 좋겠습니다.",
    status: "open",
    createdAt: "2026-07-18 20:05",
  },
  {
    id: "feedback-002",
    artifactId: "artifact-003",
    mentoringSessionId: "mentoring-002",
    authorId: "mentor-001",
    targetTeamId: "team-001",
    body: "팀 연구계획서는 질문 범위를 좁히고 측정 가능한 변수 정의를 보강해야 합니다.",
    status: "open",
    createdAt: "2026-08-10 21:00",
  },
];

export const learningOutcomes: LearningOutcome[] = [
  {
    id: "outcome-001",
    code: "LO-01",
    title: "문제 인식과 연구 질문",
    description: "임상 또는 바이오메디컬 맥락의 문제를 연구 가능한 질문으로 전환한다.",
    category: "research_foundation",
  },
  {
    id: "outcome-002",
    code: "LO-02",
    title: "문헌 탐색과 근거 해석",
    description: "핵심 문헌을 탐색하고 연구 질문과 연결되는 근거를 정리한다.",
    category: "research_foundation",
  },
  {
    id: "outcome-003",
    code: "LO-03",
    title: "연구 설계",
    description: "대상, 변수, 방법을 포함한 실행 가능한 연구계획을 구성한다.",
    category: "research_design",
  },
  {
    id: "outcome-004",
    code: "LO-04",
    title: "과학 커뮤니케이션",
    description: "연구 아이디어와 산출물을 명확한 글과 발표 구조로 전달한다.",
    category: "communication",
  },
  {
    id: "outcome-005",
    code: "LO-05",
    title: "의사과학자 진로 성찰",
    description: "개인의 관심, 역량, 진로 동기를 의사과학자 성장 경로와 연결한다.",
    category: "career",
  },
];

export const rubrics: Rubric[] = [
  {
    id: "rubric-001",
    artifactType: "profile",
    title: "연구 관심사 자기소개 루브릭",
    maxScore: 15,
    status: "active",
  },
  {
    id: "rubric-002",
    artifactType: "research_plan",
    title: "연구계획서 초안 루브릭",
    maxScore: 20,
    status: "active",
  },
];

export const rubricItems: RubricItem[] = [
  {
    id: "rubric-item-001",
    rubricId: "rubric-001",
    title: "문제 맥락",
    description: "관심 주제의 배경과 문제 상황을 구체적으로 설명한다.",
    maxScore: 5,
    outcomeIds: ["outcome-001"],
  },
  {
    id: "rubric-item-002",
    rubricId: "rubric-001",
    title: "진로 성찰",
    description: "개인의 관심과 의사과학자 진로 동기를 연결한다.",
    maxScore: 5,
    outcomeIds: ["outcome-005"],
  },
  {
    id: "rubric-item-003",
    rubricId: "rubric-001",
    title: "표현 명료성",
    description: "핵심 메시지를 읽기 쉬운 구조로 전달한다.",
    maxScore: 5,
    outcomeIds: ["outcome-004"],
  },
  {
    id: "rubric-item-004",
    rubricId: "rubric-002",
    title: "연구 질문의 초점",
    description: "연구 질문이 측정 가능하고 범위가 적절하다.",
    maxScore: 5,
    outcomeIds: ["outcome-001", "outcome-003"],
  },
  {
    id: "rubric-item-005",
    rubricId: "rubric-002",
    title: "근거와 문헌 연결",
    description: "선행 근거가 연구 필요성과 자연스럽게 연결된다.",
    maxScore: 5,
    outcomeIds: ["outcome-002"],
  },
  {
    id: "rubric-item-006",
    rubricId: "rubric-002",
    title: "방법 설계",
    description: "대상, 변수, 분석 방향이 실행 가능한 수준으로 제시된다.",
    maxScore: 5,
    outcomeIds: ["outcome-003"],
  },
  {
    id: "rubric-item-007",
    rubricId: "rubric-002",
    title: "계획서 구성",
    description: "연구계획서의 구조와 표현이 명확하다.",
    maxScore: 5,
    outcomeIds: ["outcome-004"],
  },
];

export const evaluations: Evaluation[] = [
  {
    id: "evaluation-001",
    artifactId: "artifact-001",
    rubricId: "rubric-001",
    evaluatorId: "mentor-001",
    evaluatedAt: "2026-07-19 10:30",
    totalScore: 12,
    maxScore: 15,
    overallComment: "관심 주제와 진로 동기는 잘 드러나며, 연구 질문 형태로 더 좁히면 좋겠습니다.",
    status: "submitted",
  },
  {
    id: "evaluation-002",
    artifactId: "artifact-003",
    rubricId: "rubric-002",
    evaluatorId: "pi-001",
    evaluatedAt: "2026-08-13 14:00",
    totalScore: 15,
    maxScore: 20,
    overallComment: "연구 질문의 방향은 좋고, 변수 정의와 방법 설계 보완이 필요합니다.",
    status: "submitted",
  },
];

export const evaluationItemScores: EvaluationItemScore[] = [
  {
    id: "score-001",
    evaluationId: "evaluation-001",
    rubricItemId: "rubric-item-001",
    score: 4,
    comment: "문제 상황은 구체적이나 연구 질문으로 더 정제해야 합니다.",
  },
  {
    id: "score-002",
    evaluationId: "evaluation-001",
    rubricItemId: "rubric-item-002",
    score: 5,
    comment: "진로 동기와 개인 경험 연결이 좋습니다.",
  },
  {
    id: "score-003",
    evaluationId: "evaluation-001",
    rubricItemId: "rubric-item-003",
    score: 3,
    comment: "문단 구조를 조금 더 명확히 다듬으면 좋겠습니다.",
  },
  {
    id: "score-004",
    evaluationId: "evaluation-002",
    rubricItemId: "rubric-item-004",
    score: 4,
    comment: "질문 방향은 적절하며 대상 범위를 좁힐 필요가 있습니다.",
  },
  {
    id: "score-005",
    evaluationId: "evaluation-002",
    rubricItemId: "rubric-item-005",
    score: 3,
    comment: "핵심 문헌과 연구 필요성의 연결을 보강해야 합니다.",
  },
  {
    id: "score-006",
    evaluationId: "evaluation-002",
    rubricItemId: "rubric-item-006",
    score: 4,
    comment: "변수 정의가 일부 필요하지만 실행 방향은 보입니다.",
  },
  {
    id: "score-007",
    evaluationId: "evaluation-002",
    rubricItemId: "rubric-item-007",
    score: 4,
    comment: "계획서 흐름은 읽기 좋습니다.",
  },
];

export const outcomeEvidence: OutcomeEvidence[] = [
  {
    id: "evidence-001",
    outcomeId: "outcome-005",
    studentId: "student-001",
    sourceType: "artifact",
    sourceId: "artifact-001",
    evidenceLabel: "연구 관심사 자기소개 제출",
    recordedAt: "2026-07-07 21:10",
  },
  {
    id: "evidence-002",
    outcomeId: "outcome-001",
    studentId: "student-001",
    sourceType: "evaluation",
    sourceId: "evaluation-001",
    evidenceLabel: "문제 맥락 루브릭 점수 4/5",
    recordedAt: "2026-07-19 10:30",
  },
  {
    id: "evidence-003",
    outcomeId: "outcome-004",
    studentId: "student-001",
    sourceType: "feedback",
    sourceId: "feedback-001",
    evidenceLabel: "관심 주제 설명에 대한 멘토 피드백",
    recordedAt: "2026-07-18 20:05",
  },
  {
    id: "evidence-004",
    outcomeId: "outcome-003",
    studentId: "student-001",
    sourceType: "evaluation",
    sourceId: "evaluation-002",
    evidenceLabel: "연구계획서 방법 설계 점수 4/5",
    recordedAt: "2026-08-13 14:00",
  },
];

export const riskSignals: RiskSignal[] = [
  {
    id: "risk-001",
    cohortId: cohort2026.id,
    targetType: "student",
    targetId: "student-001",
    riskType: "artifact_missing",
    severity: "medium",
    relatedObjectType: "artifact",
    relatedObjectId: "artifact-002",
    actionStatus: "open",
    actionNote: "문헌 탐색 기록 제출 마감 전 리마인드 필요",
  },
  {
    id: "risk-002",
    cohortId: cohort2026.id,
    targetType: "team",
    targetId: "team-001",
    riskType: "mentoring_issue",
    severity: "low",
    relatedObjectType: "mentoring_session",
    relatedObjectId: "mentoring-001",
    actionStatus: "in_progress",
    actionNote: "첫 멘토링 외부 링크 확인 필요",
  },
  {
    id: "risk-003",
    cohortId: cohort2026.id,
    targetType: "student",
    targetId: "student-001",
    riskType: "learning_piece_delay",
    severity: "low",
    relatedObjectType: "learning_piece",
    relatedObjectId: "lp-003",
    actionStatus: "open",
    actionNote: "영상 학습 진행 중 상태가 3일 이상 유지됨",
  },
];

export const reminderCandidates: ReminderCandidate[] = [
  {
    id: "reminder-001",
    riskSignalId: "risk-001",
    targetType: "student",
    targetId: "student-001",
    reason: "산출물 제출 마감이 임박했습니다.",
    channel: "email",
    sendStatus: "pending",
    recommendedAt: "2026-07-22 09:00",
  },
  {
    id: "reminder-002",
    riskSignalId: "risk-003",
    targetType: "student",
    targetId: "student-001",
    reason: "학습피스 진행 상태 확인이 필요합니다.",
    channel: "manual",
    sendStatus: "pending",
    recommendedAt: "2026-07-13 09:00",
  },
  {
    id: "reminder-003",
    riskSignalId: "risk-002",
    targetType: "team",
    targetId: "team-001",
    reason: "멘토링 참석 링크를 확인해야 합니다.",
    channel: "kakao",
    sendStatus: "sent",
    recommendedAt: "2026-07-17 09:00",
    sentAt: "2026-07-17 10:10",
  },
];

export const notices: Notice[] = [
  {
    id: "notice-001",
    cohortId: cohort2026.id,
    title: "7월 학습피스 진행 안내",
    body: "오리엔테이션 이후 연구 관심사 자기소개와 연구 질문 강의를 순서대로 진행해 주세요.",
    targetScopeType: "cohort",
    targetScopeId: cohort2026.id,
    publishedAt: "2026-07-01 10:00",
    createdBy: "operator-001",
    readCount: 43,
  },
  {
    id: "notice-002",
    cohortId: cohort2026.id,
    title: "멘토링 외부 회의 링크 확인",
    body: "멘토링 전 외부 회의 링크와 접속 환경을 미리 확인해 주세요.",
    targetScopeType: "team",
    targetScopeId: "team-001",
    publishedAt: "2026-07-17 11:00",
    createdBy: "operator-001",
    readCount: 4,
  },
];

export const programTemplates: ProgramTemplate[] = [
  {
    id: "template-ps-track-v1",
    title: "미래 의사과학자 챌린지 트랙 기본 템플릿",
    version: "2026.1",
    cloneableObjectTypes: [
      "module",
      "content",
      "learning_piece",
      "rubric",
      "learning_outcome",
      "schedule_template",
    ],
    excludedObjectTypes: ["participant", "team_assignment", "submission", "feedback", "evaluation"],
  },
];

export const scheduleTemplates: ScheduleTemplate[] = [
  {
    id: "schedule-template-001",
    templateId: "template-ps-track-v1",
    objectType: "module",
    objectId: "module-001",
    relativeStartDay: 0,
    relativeDueDay: 7,
  },
  {
    id: "schedule-template-002",
    templateId: "template-ps-track-v1",
    objectType: "learning_piece",
    objectId: "lp-002",
    relativeStartDay: 0,
    relativeDueDay: 7,
  },
  {
    id: "schedule-template-003",
    templateId: "template-ps-track-v1",
    objectType: "learning_piece",
    objectId: "lp-004",
    relativeStartDay: 15,
    relativeDueDay: 23,
  },
  {
    id: "schedule-template-004",
    templateId: "template-ps-track-v1",
    objectType: "learning_piece",
    objectId: "lp-005",
    relativeStartDay: 31,
    relativeDueDay: 42,
  },
  {
    id: "schedule-template-005",
    templateId: "template-ps-track-v1",
    objectType: "survey",
    objectId: "survey-001",
    relativeStartDay: 0,
    relativeDueDay: 5,
  },
  {
    id: "schedule-template-006",
    templateId: "template-ps-track-v1",
    objectType: "survey",
    objectId: "survey-002",
    relativeStartDay: 110,
    relativeDueDay: 122,
  },
];

export const surveys: Survey[] = [
  {
    id: "survey-001",
    cohortId: cohort2026.id,
    title: "사전 진로·역량 설문",
    surveyType: "pre",
    externalUrl: "https://forms.example.com/ps-track-pre",
    targetScopeType: "cohort",
    targetScopeId: cohort2026.id,
    dueAt: "2026-07-06",
    linkedOutcomeIds: ["outcome-005"],
  },
  {
    id: "survey-002",
    cohortId: cohort2026.id,
    title: "사후 성과 체감 설문",
    surveyType: "post",
    externalUrl: "https://forms.example.com/ps-track-post",
    targetScopeType: "cohort",
    targetScopeId: cohort2026.id,
    dueAt: "2026-10-31",
    linkedOutcomeIds: ["outcome-001", "outcome-003", "outcome-005"],
  },
];

export const surveyResponses: SurveyResponse[] = [
  {
    id: "survey-response-001",
    surveyId: "survey-001",
    respondentId: "student-001",
    responseStatus: "responded",
    respondedAt: "2026-07-04 19:30",
  },
  {
    id: "survey-response-002",
    surveyId: "survey-002",
    respondentId: "student-001",
    responseStatus: "sent",
  },
];

export const reportExports: ReportExport[] = [
  {
    id: "report-export-001",
    reportType: "participation",
    title: "참여율 / 완료율 리포트",
    format: "csv",
    generatedAt: "2026-08-15 09:00",
    rowCount: studentLearningPieceStatuses.length,
  },
  {
    id: "report-export-002",
    reportType: "artifact_status",
    title: "산출물 현황 리포트",
    format: "csv",
    generatedAt: "2026-08-15 09:05",
    rowCount: artifacts.length,
  },
  {
    id: "report-export-003",
    reportType: "outcome_summary",
    title: "학습성과 요약 리포트",
    format: "csv",
    generatedAt: "2026-08-15 09:10",
    rowCount: learningOutcomes.length,
  },
];

export const pwaQualityChecks: PwaQualityCheck[] = [
  {
    id: "pwa-check-001",
    label: "Manifest",
    status: "pass",
    detail: "앱 이름, short name, theme color, standalone display 설정 완료",
  },
  {
    id: "pwa-check-002",
    label: "모바일 내비게이션",
    status: "pass",
    detail: "상단 내비게이션은 작은 화면에서 가로 스크롤로 접근 가능",
  },
  {
    id: "pwa-check-003",
    label: "오프라인 캐시",
    status: "warning",
    detail: "서비스 워커와 오프라인 캐시는 별도 고도화 단계에서 연결",
  },
];

export const routeAccessPolicies: RouteAccessPolicy[] = [
  {
    href: "/dashboard",
    label: "대시보드",
    roles: ["student", "operator", "mentor", "pi", "admin"],
    targetScopeType: "program",
    targetScopeId: "program-ps-track",
    navGroup: "core",
  },
  {
    href: "/student",
    label: "학생",
    roles: ["student", "operator", "mentor", "pi", "admin"],
    targetScopeType: "student",
    targetScopeId: "student-001",
    navGroup: "learning",
  },
  {
    href: "/journeys/students",
    label: "여정",
    roles: ["operator", "mentor", "pi", "admin"],
    targetScopeType: "cohort",
    targetScopeId: cohort2026.id,
    navGroup: "learning",
  },
  {
    href: "/objects/learning-pieces",
    label: "학습피스",
    roles: ["student", "operator", "mentor", "pi", "admin"],
    targetScopeType: "cohort",
    targetScopeId: cohort2026.id,
    navGroup: "learning",
  },
  {
    href: "/artifacts",
    label: "산출물",
    roles: ["student", "operator", "mentor", "pi", "admin"],
    targetScopeType: "cohort",
    targetScopeId: cohort2026.id,
    navGroup: "learning",
  },
  {
    href: "/outcomes",
    label: "성과",
    roles: ["operator", "mentor", "pi", "admin"],
    targetScopeType: "program",
    targetScopeId: "program-ps-track",
    navGroup: "learning",
  },
  {
    href: "/pi/dashboard",
    label: "PI",
    roles: ["pi", "admin"],
    targetScopeType: "program",
    targetScopeId: "program-ps-track",
    navGroup: "core",
  },
  {
    href: "/mentoring/sessions",
    label: "멘토링",
    roles: ["student", "operator", "mentor", "pi", "admin"],
    targetScopeType: "cohort",
    targetScopeId: cohort2026.id,
    navGroup: "learning",
  },
  {
    href: "/cohorts/2026",
    label: "운영",
    roles: ["operator", "pi", "admin"],
    targetScopeType: "cohort",
    targetScopeId: cohort2026.id,
    navGroup: "operations",
  },
  {
    href: "/templates",
    label: "템플릿",
    roles: ["operator", "admin"],
    targetScopeType: "program",
    targetScopeId: "program-ps-track",
    navGroup: "operations",
  },
  {
    href: "/surveys",
    label: "설문",
    roles: ["operator", "pi", "admin"],
    targetScopeType: "cohort",
    targetScopeId: cohort2026.id,
    navGroup: "operations",
  },
  {
    href: "/reports",
    label: "리포트",
    roles: ["operator", "pi", "admin"],
    targetScopeType: "cohort",
    targetScopeId: cohort2026.id,
    navGroup: "operations",
  },
  {
    href: "/notices",
    label: "공지",
    roles: ["student", "operator", "mentor", "pi", "admin"],
    targetScopeType: "cohort",
    targetScopeId: cohort2026.id,
    navGroup: "operations",
  },
  {
    href: "/admin/users",
    label: "사용자",
    roles: ["admin"],
    targetScopeType: "system",
    targetScopeId: "system",
    navGroup: "admin",
  },
  {
    href: "/admin/roles",
    label: "권한",
    roles: ["admin"],
    targetScopeType: "system",
    targetScopeId: "system",
    navGroup: "admin",
  },
  {
    href: "/admin/audit-logs",
    label: "감사 로그",
    roles: ["admin"],
    targetScopeType: "system",
    targetScopeId: "system",
    navGroup: "admin",
  },
  {
    href: "/admin/access-logs",
    label: "접속 로그",
    roles: ["admin"],
    targetScopeType: "system",
    targetScopeId: "system",
    navGroup: "admin",
  },
  {
    href: "/admin/pwa",
    label: "PWA",
    roles: ["admin"],
    targetScopeType: "system",
    targetScopeId: "system",
    navGroup: "admin",
  },
  {
    href: "/admin/settings",
    label: "설정",
    roles: ["admin"],
    targetScopeType: "system",
    targetScopeId: "system",
    navGroup: "admin",
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

export function canAccessRoute(role: Role, href: string) {
  const policy = routeAccessPolicies.find((item) => item.href === href);
  const assignment = getDefaultAssignment(role);

  if (!policy || !policy.roles.includes(role)) return false;
  if (assignment.status !== "active") return false;
  if (policy.targetScopeType === "system") {
    return canAccess(assignment, "read", policy.targetScopeType, policy.targetScopeId);
  }
  if (["operator", "pi", "admin"].includes(role)) {
    return canAccess(assignment, "read", policy.targetScopeType, policy.targetScopeId);
  }
  if (role === "student") {
    return ["program", "cohort", "student"].includes(policy.targetScopeType);
  }
  if (role === "mentor") {
    return ["program", "cohort", "team", "student"].includes(policy.targetScopeType);
  }
  return false;
}

export function getAccessibleNavItems(role: Role) {
  return routeAccessPolicies.filter((policy) => canAccessRoute(role, policy.href));
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

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getProgramTemplateById(templateId: string) {
  return programTemplates.find((template) => template.id === templateId);
}

export function getScheduleTemplatePreview(templateId: string, cohortStartDate: string) {
  return scheduleTemplates
    .filter((template) => template.templateId === templateId)
    .map((template) => ({
      ...template,
      plannedStartAt: addDays(cohortStartDate, template.relativeStartDay),
      plannedDueAt: addDays(cohortStartDate, template.relativeDueDay),
      objectTitle:
        getLearningPieceById(template.objectId)?.title ??
        getModuleById(template.objectId)?.title ??
        surveys.find((survey) => survey.id === template.objectId)?.title ??
        template.objectId,
    }));
}

export function getSurveyResponses(surveyId: string) {
  return surveyResponses.filter((response) => response.surveyId === surveyId);
}

export function getSurveyResponseSummary(surveyId: string) {
  const responses = getSurveyResponses(surveyId);
  const responded = responses.filter((response) => response.responseStatus === "responded").length;

  return {
    total: responses.length,
    responded,
    pending: responses.length - responded,
    responseRate: responses.length ? Math.round((responded / responses.length) * 100) : 0,
  };
}

export function getParticipationReportRows() {
  return studentLearningPieceStatuses.map((status) => {
    const piece = getLearningPieceById(status.learningPieceId);
    return {
      student: getStudentById(status.studentId)?.name ?? status.studentId,
      learningPiece: piece?.title ?? status.learningPieceId,
      status: getStatusLabel(status.status),
      updatedAt: status.updatedAt,
    };
  });
}

export function getArtifactReportRows() {
  return artifacts.map((artifact) => ({
    artifact: artifact.title,
    owner: getArtifactOwnerName(artifact),
    status: getArtifactStatusLabel(artifact.status),
    dueAt: artifact.dueAt,
    finalConfirmed: artifact.finalConfirmed ? "Y" : "N",
  }));
}

function toCsvRow(values: Array<string | number>) {
  return values
    .map((value) => {
      const text = String(value);
      if (/[",\n\r]/.test(text)) {
        return `"${text.replaceAll('"', '""')}"`;
      }
      return text;
    })
    .join(",");
}

export function getCsvPreview(reportType: ReportExport["reportType"]) {
  if (reportType === "participation") {
    const rows = getParticipationReportRows();
    return [
      toCsvRow(["student", "learning_piece", "status", "updated_at"]),
      ...rows.map((row) => toCsvRow([row.student, row.learningPiece, row.status, row.updatedAt])),
    ].join("\n");
  }
  if (reportType === "artifact_status") {
    const rows = getArtifactReportRows();
    return [
      toCsvRow(["artifact", "owner", "status", "due_at", "final_confirmed"]),
      ...rows.map((row) =>
        toCsvRow([row.artifact, row.owner, row.status, row.dueAt, row.finalConfirmed]),
      ),
    ].join("\n");
  }

  return [
    toCsvRow(["outcome", "average_rate", "evidence_count"]),
    ...learningOutcomes.map((outcome) => {
      const summary = getOutcomeScoreSummary(outcome.id);
      return toCsvRow([outcome.title, `${summary.averageRate}%`, summary.evidenceCount]);
    }),
  ].join("\n");
}

export function getUserById(userId: string) {
  return users.find((user) => user.id === userId);
}

export function getTeamById(teamId: string) {
  return teams.find((team) => team.id === teamId);
}

export function getArtifactById(artifactId: string) {
  return artifacts.find((artifact) => artifact.id === artifactId);
}

export function getArtifactOwnerName(artifact: Artifact) {
  if (artifact.ownerType === "student") {
    return getUserById(artifact.ownerId)?.name ?? artifact.ownerId;
  }
  return getTeamById(artifact.ownerId)?.name ?? artifact.ownerId;
}

export function getArtifactStatusLabel(status: ArtifactStatus) {
  const labels: Record<ArtifactStatus, string> = {
    not_started: "작성 전",
    drafting: "작성 중",
    submitted: "제출됨",
    in_review: "리뷰 중",
    revision_requested: "수정 요청",
    pending_evaluation: "평가 대기",
    evaluated: "평가 완료",
    final_confirmed: "최종 확정",
  };

  return labels[status];
}

export function getArtifactSubmissions(artifactId: string) {
  return submissions.filter((submission) => submission.artifactId === artifactId);
}

export function getArtifactFeedback(artifactId: string) {
  return feedback.filter((item) => item.artifactId === artifactId);
}

export function getRubricById(rubricId: string) {
  return rubrics.find((rubric) => rubric.id === rubricId);
}

export function getRubricForArtifact(artifact: Artifact) {
  return rubrics.find(
    (rubric) => rubric.artifactType === artifact.artifactType && rubric.status === "active",
  );
}

export function getRubricItems(rubricId: string) {
  return rubricItems.filter((item) => item.rubricId === rubricId);
}

export function getArtifactEvaluations(artifactId: string) {
  return evaluations.filter((evaluation) => evaluation.artifactId === artifactId);
}

export function getEvaluationById(evaluationId: string) {
  return evaluations.find((evaluation) => evaluation.id === evaluationId);
}

export function getEvaluationItemScores(evaluationId: string) {
  return evaluationItemScores.filter((score) => score.evaluationId === evaluationId);
}

export function getLearningOutcomeById(outcomeId: string) {
  return learningOutcomes.find((outcome) => outcome.id === outcomeId);
}

export function getOutcomeEvidence(outcomeId: string) {
  return outcomeEvidence.filter((evidence) => evidence.outcomeId === outcomeId);
}

export function getStudentOutcomeEvidence(studentId: string) {
  return outcomeEvidence.filter((evidence) => evidence.studentId === studentId);
}

export function getOutcomeScoreSummary(outcomeId: string) {
  const relatedItemIds = rubricItems
    .filter((item) => item.outcomeIds.includes(outcomeId))
    .map((item) => item.id);
  const scores = evaluationItemScores.filter((score) =>
    relatedItemIds.includes(score.rubricItemId),
  );
  const maxScore = scores.reduce((sum, score) => {
    const item = rubricItems.find((rubricItem) => rubricItem.id === score.rubricItemId);
    return sum + (item?.maxScore ?? 0);
  }, 0);
  const totalScore = scores.reduce((sum, score) => sum + score.score, 0);

  return {
    totalScore,
    maxScore,
    averageRate: maxScore ? Math.round((totalScore / maxScore) * 100) : 0,
    evidenceCount: getOutcomeEvidence(outcomeId).length,
  };
}

export function getProgramEvaluationSummary() {
  const submittedEvaluations = evaluations.filter((evaluation) => evaluation.status === "submitted");
  const totalScore = submittedEvaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0);
  const maxScore = submittedEvaluations.reduce((sum, evaluation) => sum + evaluation.maxScore, 0);
  const evaluatedArtifactIds = new Set(submittedEvaluations.map((evaluation) => evaluation.artifactId));
  const pendingArtifacts = artifacts.filter((artifact) => !evaluatedArtifactIds.has(artifact.id));

  return {
    evaluationCount: submittedEvaluations.length,
    averageRate: maxScore ? Math.round((totalScore / maxScore) * 100) : 0,
    pendingEvaluationCount: pendingArtifacts.length,
    outcomeCount: learningOutcomes.length,
  };
}

export function getMentoringSessionById(sessionId: string) {
  return mentoringSessions.find((session) => session.id === sessionId);
}

export function getMentoringTargetName(session: MentoringSession) {
  if (session.targetType === "student") {
    return getUserById(session.targetId)?.name ?? session.targetId;
  }
  return getTeamById(session.targetId)?.name ?? session.targetId;
}

export function getMentoringStatusLabel(status: MentoringSession["status"]) {
  const labels: Record<MentoringSession["status"], string> = {
    scheduled: "예정",
    completed: "완료",
    absent: "불참",
    cancelled: "취소",
  };

  return labels[status];
}

export function getRiskSignalById(riskSignalId: string) {
  return riskSignals.find((risk) => risk.id === riskSignalId);
}

export function getRiskTargetName(risk: RiskSignal | ReminderCandidate) {
  if (risk.targetType === "student") {
    return getUserById(risk.targetId)?.name ?? risk.targetId;
  }
  return getTeamById(risk.targetId)?.name ?? risk.targetId;
}

export function getRiskTypeLabel(type: RiskSignal["riskType"]) {
  const labels: Record<RiskSignal["riskType"], string> = {
    learning_piece_delay: "학습피스 지연",
    artifact_missing: "산출물 미제출",
    mentoring_issue: "멘토링 이슈",
  };

  return labels[type];
}

export function getReminderStatusLabel(status: ReminderCandidate["sendStatus"]) {
  const labels: Record<ReminderCandidate["sendStatus"], string> = {
    pending: "발송 대기",
    sent: "발송 완료",
    skipped: "보류",
  };

  return labels[status];
}
