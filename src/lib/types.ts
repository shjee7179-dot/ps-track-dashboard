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
  cloneableObjectTypes: Array<
    "module" | "content" | "learning_piece" | "rubric" | "learning_outcome" | "schedule_template"
  >;
  excludedObjectTypes: Array<
    "participant" | "team_assignment" | "submission" | "feedback" | "evaluation"
  >;
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
