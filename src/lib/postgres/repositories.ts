import "server-only";

import type { QueryConfig, QueryResultRow } from "pg";

import { mockRepositories } from "@/lib/mock-repositories";
import { queryPostgres, transactionPostgres } from "@/lib/postgres/client";
import type {
  AdminRepository,
  AccessLogDraft,
  AuditLogDraft,
  AuditWriteContext,
  ArtifactRepository,
  CohortRepository,
  EvaluationRepository,
  JourneySummary,
  LearningRepository,
  MutationResult,
  OutcomeScoreSummary,
  StudentJourneyItem,
  UserRepository,
} from "@/lib/repository-contracts";
import type {
  LmsContentGroup,
  LmsContentMapping,
  LmsContentMappingActivationRule,
  LmsContentMappingRepository,
  LmsContentMappingStatus,
  LmsContentType,
} from "@/lib/lms/contracts";
import type {
  Artifact,
  ArtifactStatus,
  Content,
  Cohort,
  Evaluation,
  EvaluationItemScore,
  Feedback,
  LearningPiece,
  LearningPieceStatus,
  LearningOutcome,
  LogEvent,
  Module,
  OutcomeEvidence,
  Role,
  RoleAssignment,
  Rubric,
  RubricItem,
  ScopeType,
  StudentLearningPieceStatus,
  Submission,
  User,
} from "@/lib/types";

type UserRow = {
  id: string;
  external_subject: string | null;
  email: string;
  name: string;
  affiliation: string;
  default_role: string;
  status: string;
};

type RoleAssignmentRow = {
  id: string;
  user_id: string;
  role: string;
  scope_type: string;
  scope_id: string;
  status: string;
};

type CohortRow = {
  id: string;
  name: string;
  agreement_date: Date | string | null;
  starts_at: Date | string;
  ends_at: Date | string;
  status: string;
};

type LmsContentMappingRow = {
  id: string;
  cohort_id: string;
  module_id: string;
  content_id: string;
  learning_piece_id: string;
  lms_content_id: string;
  lms_course_round_id: string | null;
  content_group: string;
  content_type: string;
  required: boolean;
  activation_rule: string;
  status: string;
  created_by: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type LearningPieceStatusRow = {
  id: string;
  student_id: string;
  learning_piece_id: string;
  status: string;
  updated_at: Date | string;
  completed_at: Date | string | null;
  note: string | null;
};

type ModuleRow = {
  id: string;
  title: string;
  description: string;
  order_index: number;
  status: string;
};

type ContentRow = {
  id: string;
  module_id: string;
  title: string;
  content_type: string;
};

type LearningPieceRow = {
  id: string;
  module_id: string;
  content_id: string | null;
  title: string;
  piece_type: string;
  completion_rule: string;
  opens_at: Date | string;
  due_at: Date | string;
  requires_submission: boolean;
  requires_approval: boolean;
  requires_evaluation: boolean;
  outcome_tags: string[] | null;
};

type ArtifactRow = {
  id: string;
  cohort_id: string;
  artifact_type: string;
  title: string;
  owner_type: string;
  owner_id: string;
  learning_piece_id: string | null;
  status: string;
  due_at: Date | string;
  final_confirmed: boolean;
  outcome_tags: string[] | null;
};

type SubmissionRow = {
  id: string;
  artifact_id: string;
  submitted_by: string;
  version: number;
  submitted_at: Date | string;
  file_name: string | null;
  external_url: string | null;
  note: string;
};

type FeedbackRow = {
  id: string;
  artifact_id: string | null;
  mentoring_session_id: string | null;
  author_id: string;
  target_user_id: string | null;
  target_team_id: string | null;
  body: string;
  status: string;
  created_at: Date | string;
};

type LearningOutcomeRow = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
};

type RubricRow = {
  id: string;
  artifact_type: string;
  title: string;
  max_score: number;
  status: string;
};

type RubricItemRow = {
  id: string;
  rubric_id: string;
  title: string;
  description: string;
  max_score: number;
  outcome_ids: string[] | null;
};

type EvaluationRow = {
  id: string;
  artifact_id: string;
  rubric_id: string;
  evaluator_id: string;
  evaluated_at: Date | string;
  total_score: number;
  max_score: number;
  overall_comment: string;
  status: string;
};

type EvaluationItemScoreRow = {
  id: string;
  evaluation_id: string;
  rubric_item_id: string;
  score: number;
  comment: string;
};

type OutcomeEvidenceRow = {
  id: string;
  outcome_id: string;
  student_id: string;
  source_type: string;
  source_id: string;
  evidence_label: string;
  recorded_at: Date | string;
};

type OutcomeSummaryRow = {
  total_score: number | string | null;
  max_score: number | string | null;
  evidence_count: number | string | null;
};

type LogEventRow = {
  id: string;
  actor_label: string;
  event: string;
  target_label: string;
  severity: string;
  occurred_at: Date | string;
};

type PostgresQuery = <R extends QueryResultRow>(
  query: string | QueryConfig,
  values?: unknown[],
) => Promise<{ rows: R[] }>;

const roles: Role[] = ["student", "operator", "mentor", "pi", "admin"];
const scopeTypes: ScopeType[] = ["system", "program", "cohort", "track", "team", "student"];
const learningPieceStatuses: LearningPieceStatus[] = [
  "locked",
  "not_started",
  "in_progress",
  "needs_submission",
  "pending_review",
  "revising",
  "pending_evaluation",
  "completed",
  "delayed",
];
const lmsContentGroups: LmsContentGroup[] = ["regular", "subscription", "community"];
const lmsContentTypes: LmsContentType[] = [
  "offline",
  "realtime",
  "hyflex",
  "online",
  "knowledge",
  "ebook",
  "learning_group",
  "seminar",
];
const lmsActivationRules: LmsContentMappingActivationRule[] = [
  "record_exists",
  "participation_active",
  "completion_completed",
];
const lmsMappingStatuses: LmsContentMappingStatus[] = ["draft", "active", "inactive"];
const moduleStatuses: Module["status"][] = ["draft", "open", "closed"];
const contentTypes: Content["contentType"][] = [
  "video",
  "reading",
  "workshop",
  "assignment",
  "practice",
  "link",
  "offline",
  "mentoring_guide",
];
const learningPieceTypes: LearningPiece["pieceType"][] = [
  "reading",
  "video",
  "workshop",
  "assignment",
  "mentoring",
  "practice",
  "mid_artifact",
  "final_artifact",
  "survey",
];
const artifactTypes: Artifact["artifactType"][] = [
  "profile",
  "literature_log",
  "research_plan",
  "presentation",
  "final_report",
];
const artifactOwnerTypes: Artifact["ownerType"][] = ["student", "team"];
const artifactStatuses: ArtifactStatus[] = [
  "not_started",
  "drafting",
  "submitted",
  "in_review",
  "revision_requested",
  "pending_evaluation",
  "evaluated",
  "final_confirmed",
];
const learningOutcomeCategories: LearningOutcome["category"][] = [
  "research_foundation",
  "research_design",
  "communication",
  "career",
];
const rubricStatuses: Rubric["status"][] = ["draft", "active", "archived"];
const evaluationStatuses: Evaluation["status"][] = ["draft", "submitted"];
const outcomeEvidenceSourceTypes: OutcomeEvidence["sourceType"][] = [
  "learning_piece",
  "artifact",
  "evaluation",
  "feedback",
];
const logSeverities: LogEvent["severity"][] = ["info", "notice", "warning"];

function isPostgresRole(value: string | null | undefined): value is Role {
  return roles.includes(value as Role);
}

function isPostgresScopeType(value: string): value is ScopeType {
  return scopeTypes.includes(value as ScopeType);
}

function isLearningPieceStatus(value: string): value is LearningPieceStatus {
  return learningPieceStatuses.includes(value as LearningPieceStatus);
}

function isLmsContentGroup(value: string): value is LmsContentGroup {
  return lmsContentGroups.includes(value as LmsContentGroup);
}

function isLmsContentType(value: string): value is LmsContentType {
  return lmsContentTypes.includes(value as LmsContentType);
}

function isLmsActivationRule(value: string): value is LmsContentMappingActivationRule {
  return lmsActivationRules.includes(value as LmsContentMappingActivationRule);
}

function isLmsMappingStatus(value: string): value is LmsContentMappingStatus {
  return lmsMappingStatuses.includes(value as LmsContentMappingStatus);
}

function isModuleStatus(value: string): value is Module["status"] {
  return moduleStatuses.includes(value as Module["status"]);
}

function isContentType(value: string): value is Content["contentType"] {
  return contentTypes.includes(value as Content["contentType"]);
}

function isLearningPieceType(value: string): value is LearningPiece["pieceType"] {
  return learningPieceTypes.includes(value as LearningPiece["pieceType"]);
}

function isArtifactType(value: string): value is Artifact["artifactType"] {
  return artifactTypes.includes(value as Artifact["artifactType"]);
}

function isArtifactOwnerType(value: string): value is Artifact["ownerType"] {
  return artifactOwnerTypes.includes(value as Artifact["ownerType"]);
}

function isArtifactStatus(value: string): value is ArtifactStatus {
  return artifactStatuses.includes(value as ArtifactStatus);
}

function isLearningOutcomeCategory(value: string): value is LearningOutcome["category"] {
  return learningOutcomeCategories.includes(value as LearningOutcome["category"]);
}

function isRubricStatus(value: string): value is Rubric["status"] {
  return rubricStatuses.includes(value as Rubric["status"]);
}

function isEvaluationStatus(value: string): value is Evaluation["status"] {
  return evaluationStatuses.includes(value as Evaluation["status"]);
}

function isOutcomeEvidenceSourceType(value: string): value is OutcomeEvidence["sourceType"] {
  return outcomeEvidenceSourceTypes.includes(value as OutcomeEvidence["sourceType"]);
}

function isLogSeverity(value: string): value is LogEvent["severity"] {
  return logSeverities.includes(value as LogEvent["severity"]);
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function toDateString(value: Date | string | null) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
}

function toKoreanMinuteString(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart("hour")}:${getPart("minute")}`;
}

function mergeAuditMetadata(
  audit: AuditWriteContext | undefined,
  metadata: Record<string, unknown>,
) {
  return {
    ...(audit?.metadata ?? {}),
    ...metadata,
  };
}

function isUuid(value: string | undefined): value is string {
  return Boolean(
    value?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i),
  );
}

export function mapPostgresUser(row: UserRow): User | null {
  if (!isPostgresRole(row.default_role)) {
    return null;
  }
  if (row.status !== "active" && row.status !== "inactive") {
    return null;
  }

  return {
    id: row.id,
    externalSubject: row.external_subject ?? undefined,
    name: row.name,
    email: row.email,
    affiliation: row.affiliation,
    defaultRole: row.default_role,
    status: row.status,
  };
}

export function mapPostgresRoleAssignment(row: RoleAssignmentRow): RoleAssignment | null {
  if (!isPostgresRole(row.role) || !isPostgresScopeType(row.scope_type)) {
    return null;
  }
  if (row.status !== "active" && row.status !== "inactive") {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    role: row.role,
    scopeType: row.scope_type,
    scopeId: row.scope_id,
    status: row.status,
  };
}

export function mapPostgresCohort(row: CohortRow): Cohort | null {
  if (row.status !== "draft" && row.status !== "active" && row.status !== "closed") {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    agreementDate: toDateString(row.agreement_date),
    startsAt: toDateString(row.starts_at),
    endsAt: toDateString(row.ends_at),
    status: row.status,
  };
}

export function mapPostgresLmsContentMapping(row: LmsContentMappingRow): LmsContentMapping | null {
  if (
    !isLmsContentGroup(row.content_group) ||
    !isLmsContentType(row.content_type) ||
    !isLmsActivationRule(row.activation_rule) ||
    !isLmsMappingStatus(row.status)
  ) {
    return null;
  }

  return {
    id: row.id,
    cohortId: row.cohort_id,
    moduleId: row.module_id,
    contentId: row.content_id,
    learningPieceId: row.learning_piece_id,
    lmsContentId: row.lms_content_id,
    lmsCourseRoundId: row.lms_course_round_id ?? undefined,
    contentGroup: row.content_group,
    contentType: row.content_type,
    required: row.required,
    activationRule: row.activation_rule,
    status: row.status,
    createdBy: row.created_by ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export function mapPostgresLearningPieceStatus(
  row: LearningPieceStatusRow,
): StudentLearningPieceStatus | null {
  if (!isLearningPieceStatus(row.status)) {
    return null;
  }

  return {
    id: row.id,
    studentId: row.student_id,
    learningPieceId: row.learning_piece_id,
    status: row.status,
    updatedAt: toDateString(row.updated_at),
    completedAt: toDateString(row.completed_at) || undefined,
    note: row.note ?? undefined,
  };
}

export function mapPostgresModule(row: ModuleRow): Module | null {
  if (!isModuleStatus(row.status)) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    orderIndex: row.order_index,
    status: row.status,
  };
}

export function mapPostgresContent(row: ContentRow): Content | null {
  if (!isContentType(row.content_type)) {
    return null;
  }

  return {
    id: row.id,
    moduleId: row.module_id,
    title: row.title,
    contentType: row.content_type,
  };
}

export function mapPostgresLearningPiece(row: LearningPieceRow): LearningPiece | null {
  if (!isLearningPieceType(row.piece_type)) {
    return null;
  }

  return {
    id: row.id,
    moduleId: row.module_id,
    contentId: row.content_id ?? undefined,
    title: row.title,
    pieceType: row.piece_type,
    completionRule: row.completion_rule,
    opensAt: toDateString(row.opens_at),
    dueAt: toDateString(row.due_at),
    requiresSubmission: row.requires_submission,
    requiresApproval: row.requires_approval,
    requiresEvaluation: row.requires_evaluation,
    outcomeTags: row.outcome_tags ?? [],
  };
}

export function mapPostgresArtifact(row: ArtifactRow): Artifact | null {
  if (
    !isArtifactType(row.artifact_type) ||
    !isArtifactOwnerType(row.owner_type) ||
    !isArtifactStatus(row.status)
  ) {
    return null;
  }

  return {
    id: row.id,
    cohortId: row.cohort_id,
    artifactType: row.artifact_type,
    title: row.title,
    ownerType: row.owner_type,
    ownerId: row.owner_id,
    learningPieceId: row.learning_piece_id ?? undefined,
    status: row.status,
    dueAt: toDateString(row.due_at),
    finalConfirmed: row.final_confirmed,
    outcomeTags: row.outcome_tags ?? [],
  };
}

export function mapPostgresSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    artifactId: row.artifact_id,
    submittedBy: row.submitted_by,
    version: row.version,
    submittedAt: toIsoString(row.submitted_at),
    fileName: row.file_name ?? undefined,
    externalUrl: row.external_url ?? undefined,
    note: row.note,
  };
}

export function mapPostgresFeedback(row: FeedbackRow): Feedback | null {
  if (row.status !== "open" && row.status !== "resolved") {
    return null;
  }

  return {
    id: row.id,
    artifactId: row.artifact_id ?? undefined,
    mentoringSessionId: row.mentoring_session_id ?? undefined,
    authorId: row.author_id,
    targetUserId: row.target_user_id ?? undefined,
    targetTeamId: row.target_team_id ?? undefined,
    body: row.body,
    status: row.status,
    createdAt: toIsoString(row.created_at),
  };
}

export function mapPostgresLearningOutcome(row: LearningOutcomeRow): LearningOutcome | null {
  if (!isLearningOutcomeCategory(row.category)) {
    return null;
  }

  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    category: row.category,
  };
}

export function mapPostgresRubric(row: RubricRow): Rubric | null {
  if (!isArtifactType(row.artifact_type) || !isRubricStatus(row.status)) {
    return null;
  }

  return {
    id: row.id,
    artifactType: row.artifact_type,
    title: row.title,
    maxScore: row.max_score,
    status: row.status,
  };
}

export function mapPostgresRubricItem(row: RubricItemRow): RubricItem {
  return {
    id: row.id,
    rubricId: row.rubric_id,
    title: row.title,
    description: row.description,
    maxScore: row.max_score,
    outcomeIds: row.outcome_ids ?? [],
  };
}

export function mapPostgresEvaluation(row: EvaluationRow): Evaluation | null {
  if (!isEvaluationStatus(row.status)) {
    return null;
  }

  return {
    id: row.id,
    artifactId: row.artifact_id,
    rubricId: row.rubric_id,
    evaluatorId: row.evaluator_id,
    evaluatedAt: toIsoString(row.evaluated_at),
    totalScore: row.total_score,
    maxScore: row.max_score,
    overallComment: row.overall_comment,
    status: row.status,
  };
}

export function mapPostgresEvaluationItemScore(
  row: EvaluationItemScoreRow,
): EvaluationItemScore {
  return {
    id: row.id,
    evaluationId: row.evaluation_id,
    rubricItemId: row.rubric_item_id,
    score: row.score,
    comment: row.comment,
  };
}

export function mapPostgresOutcomeEvidence(row: OutcomeEvidenceRow): OutcomeEvidence | null {
  if (!isOutcomeEvidenceSourceType(row.source_type)) {
    return null;
  }

  return {
    id: row.id,
    outcomeId: row.outcome_id,
    studentId: row.student_id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    evidenceLabel: row.evidence_label,
    recordedAt: toIsoString(row.recorded_at),
  };
}

export function mapPostgresLogEvent(row: LogEventRow): LogEvent | null {
  if (!isLogSeverity(row.severity)) {
    return null;
  }

  return {
    id: row.id,
    actor: row.actor_label,
    event: row.event,
    target: row.target_label,
    occurredAt: toKoreanMinuteString(row.occurred_at),
    severity: row.severity,
  };
}

async function createPostgresAuditLog(
  input: AuditLogDraft,
  query: PostgresQuery = queryPostgres,
) {
  const result = await query<LogEventRow>(
    `
      insert into public.audit_logs (
        actor_id,
        actor_label,
        event,
        target_type,
        target_id,
        target_label,
        severity,
        metadata,
        occurred_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, now())
      returning id, actor_label, event, target_label, severity, occurred_at
    `,
    [
      input.actorId,
      input.actorLabel,
      input.event,
      input.targetType,
      input.targetId,
      input.targetLabel,
      input.severity ?? "notice",
      JSON.stringify(input.metadata ?? {}),
    ],
  );
  const auditLog = result.rows[0] ? mapPostgresLogEvent(result.rows[0]) : null;
  if (!auditLog) {
    throw new Error("Failed to create audit log");
  }

  return auditLog;
}

async function createPostgresAccessLog(
  input: AccessLogDraft,
  query: PostgresQuery = queryPostgres,
) {
  const result = await query<LogEventRow>(
    `
      insert into public.access_logs (
        actor_id,
        actor_label,
        event,
        target_type,
        target_id,
        target_label,
        severity,
        ip_address,
        user_agent,
        session_id,
        metadata,
        occurred_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8::inet, $9, $10, $11::jsonb, now())
      returning id, actor_label, event, target_label, severity, occurred_at
    `,
    [
      input.actorId,
      input.actorLabel,
      input.event,
      input.targetType,
      input.targetId,
      input.targetLabel,
      input.severity ?? "info",
      input.ipAddress ?? null,
      input.userAgent ?? null,
      input.sessionId ?? null,
      JSON.stringify(input.metadata ?? {}),
    ],
  );
  const accessLog = result.rows[0] ? mapPostgresLogEvent(result.rows[0]) : null;
  if (!accessLog) {
    throw new Error("Failed to create access log");
  }

  return accessLog;
}

const userSelect = `
  select id, external_subject, email, name, affiliation, default_role, status
  from public.users
`;

const lmsContentMappingSelect = `
  select
    id,
    cohort_id,
    module_id,
    content_id,
    learning_piece_id,
    lms_content_id,
    lms_course_round_id,
    content_group,
    content_type,
    required,
    activation_rule,
    status,
    created_by,
    created_at,
    updated_at
  from public.lms_content_mappings
`;

const cohortSelect = `
  select id, name, agreement_date, starts_at, ends_at, status
  from public.cohorts
`;

const learningPieceStatusSelect = `
  select id, student_id, learning_piece_id, status, updated_at, completed_at, note
  from public.learning_piece_statuses
`;

const moduleSelect = `
  select id, title, description, order_index, status
  from public.modules
`;

const contentSelect = `
  select id, module_id, title, content_type
  from public.contents
`;

const learningPieceSelect = `
  select
    id,
    module_id,
    content_id,
    title,
    piece_type,
    completion_rule,
    opens_at,
    due_at,
    requires_submission,
    requires_approval,
    requires_evaluation,
    outcome_tags
  from public.learning_pieces
`;

const artifactSelect = `
  select
    id,
    cohort_id,
    artifact_type,
    title,
    owner_type,
    owner_id,
    learning_piece_id,
    status,
    due_at,
    final_confirmed,
    outcome_tags
  from public.artifacts
`;

const submissionSelect = `
  select
    id,
    artifact_id,
    submitted_by,
    version,
    submitted_at,
    file_name,
    external_url,
    note
  from public.submissions
`;

const feedbackSelect = `
  select
    id,
    artifact_id,
    mentoring_session_id,
    author_id,
    target_user_id,
    target_team_id,
    body,
    status,
    created_at
  from public.feedback
`;

const learningOutcomeSelect = `
  select id, code, title, description, category
  from public.learning_outcomes
`;

const rubricSelect = `
  select id, artifact_type, title, max_score, status
  from public.rubrics
`;

const rubricItemSelect = `
  select id, rubric_id, title, description, max_score, outcome_ids
  from public.rubric_items
`;

const evaluationSelect = `
  select
    id,
    artifact_id,
    rubric_id,
    evaluator_id,
    evaluated_at,
    total_score,
    max_score,
    overall_comment,
    status
  from public.evaluations
`;

const evaluationItemScoreSelect = `
  select id, evaluation_id, rubric_item_id, score, comment
  from public.evaluation_item_scores
`;

const outcomeEvidenceSelect = `
  select
    id,
    outcome_id,
    student_id,
    source_type,
    source_id,
    evidence_label,
    recorded_at
  from public.outcome_evidence
`;

const auditLogSelect = `
  select id, actor_label, event, target_label, severity, occurred_at
  from public.audit_logs
`;

const accessLogSelect = `
  select id, actor_label, event, target_label, severity, occurred_at
  from public.access_logs
`;

async function resolvePostgresUserId(userIdOrAlias: string): Promise<string | undefined> {
  if (isUuid(userIdOrAlias)) {
    return userIdOrAlias;
  }

  const mockUser = await mockRepositories.users.getUserById(userIdOrAlias);
  if (!mockUser) {
    return undefined;
  }

  const result = await queryPostgres<UserRow>(
    `${userSelect} where email = $1 limit 1`,
    [mockUser.email],
  );

  return result.rows[0]?.id;
}

function summarizeJourney(items: StudentJourneyItem[]): JourneySummary {
  const completed = items.filter((item) => item.status.status === "completed").length;
  const delayed = items.filter((item) => item.status.status === "delayed").length;
  const needsAction = items.filter((item) =>
    ["needs_submission", "pending_review", "revising", "in_progress"].includes(item.status.status),
  ).length;

  return {
    total: items.length,
    completed,
    delayed,
    needsAction,
    completionRate: items.length ? Math.round((completed / items.length) * 100) : 0,
  };
}

function joinJourneyRows(
  statuses: StudentLearningPieceStatus[],
  learningPieces: LearningPiece[],
): StudentJourneyItem[] {
  return statuses
    .map((status) => ({
      status,
      learningPiece: learningPieces.find((piece) => piece.id === status.learningPieceId),
    }))
    .filter(
      (item): item is StudentJourneyItem => Boolean(item.learningPiece),
    );
}

export const postgresUserRepository: UserRepository = {
  async listUsers(query) {
    const limit = query?.limit ?? 100;
    const result = await queryPostgres<UserRow>(
      `${userSelect} order by name asc limit $1`,
      [limit],
    );

    return result.rows
      .map((row) => mapPostgresUser(row))
      .filter((user): user is User => Boolean(user));
  },
  async getUserById(userId) {
    if (!isUuid(userId)) {
      const mockUser = await mockRepositories.users.getUserById(userId);
      if (!mockUser) {
        return undefined;
      }
      const result = await queryPostgres<UserRow>(
        `${userSelect} where email = $1 limit 1`,
        [mockUser.email],
      );

      return result.rows[0] ? mapPostgresUser(result.rows[0]) ?? undefined : undefined;
    }

    const result = await queryPostgres<UserRow>(
      `${userSelect} where id = $1 limit 1`,
      [userId],
    );

    return result.rows[0] ? mapPostgresUser(result.rows[0]) ?? undefined : undefined;
  },
  async getUserByExternalSubject(externalSubject) {
    const result = await queryPostgres<UserRow>(
      `${userSelect} where external_subject = $1 limit 1`,
      [externalSubject],
    );

    return result.rows[0] ? mapPostgresUser(result.rows[0]) ?? undefined : undefined;
  },
  async listRoleAssignments(userId) {
    const baseQuery = `
      select id, user_id, role, scope_type, scope_id, status
      from public.role_assignments
    `;
    const result = userId
      ? await queryPostgres<RoleAssignmentRow>(
          `${baseQuery} where user_id = $1 order by created_at asc`,
          [userId],
        )
      : await queryPostgres<RoleAssignmentRow>(`${baseQuery} order by created_at asc`);

    return result.rows
      .map((row) => mapPostgresRoleAssignment(row))
      .filter((assignment): assignment is RoleAssignment => Boolean(assignment));
  },
};

export const postgresLearningRepository: LearningRepository = {
  async listModules(query) {
    const result = await queryPostgres<ModuleRow>(
      `${moduleSelect} order by order_index asc, title asc limit $1`,
      [query?.limit ?? 100],
    );

    return result.rows
      .map((row) => mapPostgresModule(row))
      .filter((module): module is Module => Boolean(module));
  },
  async listContents(query) {
    const values: unknown[] = [];
    const filters: string[] = [];

    if (query?.cohortId) {
      // Contents are currently global domain objects; cohort-specific
      // ownership can be added when cohort templates move into Postgres.
    }

    values.push(query?.limit ?? 100);
    const whereClause = filters.length ? ` where ${filters.join(" and ")}` : "";
    const result = await queryPostgres<ContentRow>(
      `${contentSelect}${whereClause} order by module_id asc, title asc limit $${values.length}`,
      values,
    );

    return result.rows
      .map((row) => mapPostgresContent(row))
      .filter((content): content is Content => Boolean(content));
  },
  async listLearningPieces(query) {
    const values: unknown[] = [];
    const filters: string[] = [];

    if (query?.cohortId) {
      // Learning piece definitions are global in the first Postgres cut.
      // Cohort/template scoping will be added once template cloning moves to DB.
    }

    values.push(query?.limit ?? 100);
    const whereClause = filters.length ? ` where ${filters.join(" and ")}` : "";
    const result = await queryPostgres<LearningPieceRow>(
      `${learningPieceSelect}${whereClause} order by opens_at asc, due_at asc, id asc limit $${values.length}`,
      values,
    );

    return result.rows
      .map((row) => mapPostgresLearningPiece(row))
      .filter((piece): piece is LearningPiece => Boolean(piece));
  },
  async getLearningPieceById(learningPieceId) {
    const result = await queryPostgres<LearningPieceRow>(
      `${learningPieceSelect} where id = $1 limit 1`,
      [learningPieceId],
    );

    return result.rows[0] ? mapPostgresLearningPiece(result.rows[0]) ?? undefined : undefined;
  },
  async listStudentLearningPieceStatuses(query) {
    const values: unknown[] = [];
    const filters: string[] = [];

    if (query?.studentId) {
      const postgresStudentId = await resolvePostgresUserId(query.studentId);
      if (!postgresStudentId) {
        return [];
      }
      values.push(postgresStudentId);
      filters.push(`student_id = $${values.length}`);
    }

    values.push(query?.limit ?? 100);
    const whereClause = filters.length ? ` where ${filters.join(" and ")}` : "";
    const result = await queryPostgres<LearningPieceStatusRow>(
      `${learningPieceStatusSelect}${whereClause} order by updated_at desc limit $${values.length}`,
      values,
    );

    return result.rows
      .map((row) => mapPostgresLearningPieceStatus(row))
      .filter((status): status is StudentLearningPieceStatus => Boolean(status));
  },
  async listStudentJourney(studentId) {
    const [statuses, learningPieces] = await Promise.all([
      postgresLearningRepository.listStudentLearningPieceStatuses({ studentId }),
      postgresLearningRepository.listLearningPieces(),
    ]);

    return joinJourneyRows(statuses, learningPieces);
  },
  async getJourneySummary(studentId) {
    return summarizeJourney(await postgresLearningRepository.listStudentJourney(studentId));
  },
  async updateStudentLearningPieceStatus(statusId, status, audit) {
    return transactionPostgres(async (query) => {
      const result = await query<LearningPieceStatusRow>(
        `
          update public.learning_piece_statuses
          set status = $2,
              completed_at = case
                when $2 = 'completed' then coalesce(completed_at, current_date)
                else completed_at
              end
          where id = $1
          returning id, student_id, learning_piece_id, status, updated_at, completed_at, note
        `,
        [statusId, status],
      );
      const updated = result.rows[0]
        ? mapPostgresLearningPieceStatus(result.rows[0])
        : undefined;

      if (!updated) {
        throw new Error("Failed to update learning piece status");
      }
      const auditLog = audit
        ? await createPostgresAuditLog(
            {
              ...audit,
              event: "학습피스 상태 변경",
              targetType: "learning_piece_status",
              targetId: updated.id,
              targetLabel: `${updated.learningPieceId} / ${updated.status}`,
              severity: "notice",
              metadata: mergeAuditMetadata(audit, {
                studentId: updated.studentId,
                learningPieceId: updated.learningPieceId,
                status: updated.status,
              }),
            },
            query,
          )
        : undefined;

      return {
        data: updated,
        auditLogId: auditLog?.id ?? "postgres-learning-status",
      } satisfies MutationResult<StudentLearningPieceStatus>;
    });
  },
};

export const postgresCohortRepository: CohortRepository = {
  async getActiveCohort() {
    const result = await queryPostgres<CohortRow>(
      `${cohortSelect}
       where status in ('active', 'draft')
       order by year desc, starts_at desc
       limit 1`,
    );

    return result.rows[0] ? mapPostgresCohort(result.rows[0]) ?? undefined : undefined;
  },
  listTeams: mockRepositories.cohorts.listTeams,
  getTeamById: mockRepositories.cohorts.getTeamById,
};

export const postgresArtifactRepository: ArtifactRepository = {
  async listArtifacts(query) {
    const values: unknown[] = [];
    const filters: string[] = [];

    if (query?.cohortId) {
      values.push(query.cohortId);
      filters.push(`cohort_id = $${values.length}`);
    }
    if (query?.studentId) {
      values.push(query.studentId);
      filters.push(`owner_type = 'student' and owner_id = $${values.length}`);
    }
    if (query?.teamId) {
      values.push(query.teamId);
      filters.push(`owner_type = 'team' and owner_id = $${values.length}`);
    }

    values.push(query?.limit ?? 100);
    const whereClause = filters.length ? ` where ${filters.join(" and ")}` : "";
    const result = await queryPostgres<ArtifactRow>(
      `${artifactSelect}${whereClause} order by due_at asc, id asc limit $${values.length}`,
      values,
    );

    return result.rows
      .map((row) => mapPostgresArtifact(row))
      .filter((artifact): artifact is Artifact => Boolean(artifact));
  },
  async getArtifactById(artifactId) {
    const result = await queryPostgres<ArtifactRow>(
      `${artifactSelect} where id = $1 limit 1`,
      [artifactId],
    );

    return result.rows[0] ? mapPostgresArtifact(result.rows[0]) ?? undefined : undefined;
  },
  async listSubmissions(artifactId) {
    const result = await queryPostgres<SubmissionRow>(
      `${submissionSelect} where artifact_id = $1 order by version asc`,
      [artifactId],
    );

    return result.rows.map((row) => mapPostgresSubmission(row));
  },
  async listFeedback(artifactId) {
    const result = await queryPostgres<FeedbackRow>(
      `${feedbackSelect} where artifact_id = $1 order by created_at asc`,
      [artifactId],
    );

    return result.rows
      .map((row) => mapPostgresFeedback(row))
      .filter((feedback): feedback is Feedback => Boolean(feedback));
  },
  async createSubmission(input) {
    return transactionPostgres(async (query) => {
      const result = await query<SubmissionRow>(
        `
          insert into public.submissions (
            artifact_id,
            submitted_by,
            version,
            submitted_at,
            file_name,
            external_url,
            note
          )
          select
            $1,
            $2,
            coalesce(max(version), 0) + 1,
            now(),
            $3,
            $4,
            $5
          from public.submissions
          where artifact_id = $1
          returning
            id,
            artifact_id,
            submitted_by,
            version,
            submitted_at,
            file_name,
            external_url,
            note
        `,
        [
          input.artifactId,
          input.submittedBy,
          input.fileName ?? null,
          input.externalUrl ?? null,
          input.note,
        ],
      );

      const submission = result.rows[0] ? mapPostgresSubmission(result.rows[0]) : null;
      if (!submission) {
        throw new Error("Failed to create artifact submission");
      }
      const auditLog = input.audit
        ? await createPostgresAuditLog(
            {
              ...input.audit,
              event: "산출물 제출",
              targetType: "artifact",
              targetId: submission.artifactId,
              targetLabel: submission.artifactId,
              severity: "notice",
              metadata: mergeAuditMetadata(input.audit, {
                submissionId: submission.id,
                version: submission.version,
                submittedBy: submission.submittedBy,
              }),
            },
            query,
          )
        : undefined;

      return {
        data: submission,
        auditLogId: auditLog?.id ?? "postgres-submission",
      } satisfies MutationResult<Submission>;
    });
  },
  async createFeedback(input) {
    return transactionPostgres(async (query) => {
      const result = await query<FeedbackRow>(
        `
          insert into public.feedback (
            artifact_id,
            mentoring_session_id,
            author_id,
            target_user_id,
            target_team_id,
            body,
            status
          )
          values ($1, $2, $3, $4, $5, $6, 'open')
          returning
            id,
            artifact_id,
            mentoring_session_id,
            author_id,
            target_user_id,
            target_team_id,
            body,
            status,
            created_at
        `,
        [
          input.artifactId ?? null,
          input.mentoringSessionId ?? null,
          input.authorId,
          input.targetUserId ?? null,
          input.targetTeamId ?? null,
          input.body,
        ],
      );
      const feedback = result.rows[0] ? mapPostgresFeedback(result.rows[0]) : null;
      if (!feedback) {
        throw new Error("Failed to create artifact feedback");
      }
      const auditLog = input.audit
        ? await createPostgresAuditLog(
            {
              ...input.audit,
              event: "산출물 피드백 작성",
              targetType: input.artifactId ? "artifact" : "mentoring_session",
              targetId: input.artifactId ?? input.mentoringSessionId ?? feedback.id,
              targetLabel: input.artifactId ?? input.mentoringSessionId ?? feedback.id,
              severity: "notice",
              metadata: mergeAuditMetadata(input.audit, {
                feedbackId: feedback.id,
                targetUserId: feedback.targetUserId,
                targetTeamId: feedback.targetTeamId,
              }),
            },
            query,
          )
        : undefined;

      return {
        data: feedback,
        auditLogId: auditLog?.id ?? "postgres-feedback",
      } satisfies MutationResult<Feedback>;
    });
  },
};

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

export const postgresEvaluationRepository: EvaluationRepository = {
  async listRubrics() {
    const result = await queryPostgres<RubricRow>(
      `${rubricSelect} order by artifact_type asc, title asc`,
    );

    return result.rows
      .map((row) => mapPostgresRubric(row))
      .filter((rubric): rubric is Rubric => Boolean(rubric));
  },
  async listRubricItems(rubricId) {
    const result = rubricId
      ? await queryPostgres<RubricItemRow>(
          `${rubricItemSelect} where rubric_id = $1 order by rubric_id asc, id asc`,
          [rubricId],
        )
      : await queryPostgres<RubricItemRow>(
          `${rubricItemSelect} order by rubric_id asc, id asc`,
        );

    return result.rows.map((row) => mapPostgresRubricItem(row));
  },
  async listEvaluations(artifactId) {
    const result = artifactId
      ? await queryPostgres<EvaluationRow>(
          `${evaluationSelect} where artifact_id = $1 order by created_at asc, evaluated_at asc, id asc`,
          [artifactId],
        )
      : await queryPostgres<EvaluationRow>(
          `${evaluationSelect} order by created_at asc, evaluated_at asc, id asc`,
        );

    return result.rows
      .map((row) => mapPostgresEvaluation(row))
      .filter((evaluation): evaluation is Evaluation => Boolean(evaluation));
  },
  async getEvaluationById(evaluationId) {
    const result = await queryPostgres<EvaluationRow>(
      `${evaluationSelect} where id = $1 limit 1`,
      [evaluationId],
    );

    return result.rows[0] ? mapPostgresEvaluation(result.rows[0]) ?? undefined : undefined;
  },
  async listEvaluationItemScores(evaluationId) {
    const result = await queryPostgres<EvaluationItemScoreRow>(
      `${evaluationItemScoreSelect} where evaluation_id = $1 order by rubric_item_id asc`,
      [evaluationId],
    );

    return result.rows.map((row) => mapPostgresEvaluationItemScore(row));
  },
  async createEvaluation(input) {
    return transactionPostgres(async (query) => {
      const rubricItemsResult = await query<RubricItemRow>(
        `${rubricItemSelect} where rubric_id = $1 order by rubric_id asc, id asc`,
        [input.rubricId],
      );
      const rubricItems = rubricItemsResult.rows.map((row) => mapPostgresRubricItem(row));
      if (!rubricItems.length) {
        throw new Error("Rubric items are required to create an evaluation");
      }

      const artifactResult = await query<ArtifactRow>(
        `${artifactSelect} where id = $1 limit 1`,
        [input.artifactId],
      );
      const artifact = artifactResult.rows[0]
        ? mapPostgresArtifact(artifactResult.rows[0])
        : null;
      if (!artifact) {
        throw new Error("Artifact is required to create an evaluation");
      }

      const maxScore = rubricItems.reduce((sum, item) => sum + item.maxScore, 0);
      const totalScore = input.itemScores.reduce((sum, item) => sum + item.score, 0);

      const evaluationResult = await query<EvaluationRow>(
        `
          insert into public.evaluations (
            artifact_id,
            rubric_id,
            evaluator_id,
            evaluated_at,
            total_score,
            max_score,
            overall_comment,
            status
          )
          values ($1, $2, $3, now(), $4, $5, $6, 'submitted')
          returning
            id,
            artifact_id,
            rubric_id,
            evaluator_id,
            evaluated_at,
            total_score,
            max_score,
            overall_comment,
            status
        `,
        [
          input.artifactId,
          input.rubricId,
          input.evaluatorId,
          totalScore,
          maxScore,
          input.overallComment,
        ],
      );
      const evaluation = evaluationResult.rows[0]
        ? mapPostgresEvaluation(evaluationResult.rows[0])
        : null;
      if (!evaluation) {
        throw new Error("Failed to create artifact evaluation");
      }

      for (const itemScore of input.itemScores) {
        await query(
          `
            insert into public.evaluation_item_scores (
              evaluation_id,
              rubric_item_id,
              score,
              comment
            )
            values ($1, $2, $3, $4)
          `,
          [evaluation.id, itemScore.rubricItemId, itemScore.score, itemScore.comment],
        );
      }

      const studentId = artifact.ownerType === "student" ? artifact.ownerId : "student-001";
      for (const itemScore of input.itemScores) {
        const rubricItem = rubricItems.find((item) => item.id === itemScore.rubricItemId);
        if (!rubricItem) continue;

        for (const outcomeId of rubricItem.outcomeIds) {
          await query(
            `
              insert into public.outcome_evidence (
                outcome_id,
                student_id,
                source_type,
                source_id,
                evidence_label,
                recorded_at
              )
              values ($1, $2, 'evaluation', $3, $4, now())
            `,
            [
              outcomeId,
              studentId,
              evaluation.id,
              `${rubricItem.title} 루브릭 점수 ${itemScore.score}/${rubricItem.maxScore}`,
            ],
          );
        }
      }
      const auditLog = input.audit
        ? await createPostgresAuditLog(
            {
              ...input.audit,
              event: "산출물 평가 제출",
              targetType: "artifact",
              targetId: evaluation.artifactId,
              targetLabel: artifact.title,
              severity: "notice",
              metadata: mergeAuditMetadata(input.audit, {
                evaluationId: evaluation.id,
                rubricId: evaluation.rubricId,
                totalScore: evaluation.totalScore,
                maxScore: evaluation.maxScore,
              }),
            },
            query,
          )
        : undefined;

      return {
        data: evaluation,
        auditLogId: auditLog?.id ?? "postgres-evaluation",
      } satisfies MutationResult<Evaluation>;
    });
  },
  async listLearningOutcomes() {
    const result = await queryPostgres<LearningOutcomeRow>(
      `${learningOutcomeSelect} order by code asc`,
    );

    return result.rows
      .map((row) => mapPostgresLearningOutcome(row))
      .filter((outcome): outcome is LearningOutcome => Boolean(outcome));
  },
  async getLearningOutcomeById(outcomeId) {
    const result = await queryPostgres<LearningOutcomeRow>(
      `${learningOutcomeSelect} where id = $1 limit 1`,
      [outcomeId],
    );

    return result.rows[0] ? mapPostgresLearningOutcome(result.rows[0]) ?? undefined : undefined;
  },
  async listOutcomeEvidence(outcomeId) {
    const result = outcomeId
      ? await queryPostgres<OutcomeEvidenceRow>(
          `${outcomeEvidenceSelect} where outcome_id = $1 order by recorded_at asc, id asc`,
          [outcomeId],
        )
      : await queryPostgres<OutcomeEvidenceRow>(
          `${outcomeEvidenceSelect} order by recorded_at asc, id asc`,
        );

    return result.rows
      .map((row) => mapPostgresOutcomeEvidence(row))
      .filter((evidence): evidence is OutcomeEvidence => Boolean(evidence));
  },
  async listStudentOutcomeEvidence(studentId) {
    const result = await queryPostgres<OutcomeEvidenceRow>(
      `${outcomeEvidenceSelect} where student_id = $1 order by recorded_at asc, id asc`,
      [studentId],
    );

    return result.rows
      .map((row) => mapPostgresOutcomeEvidence(row))
      .filter((evidence): evidence is OutcomeEvidence => Boolean(evidence));
  },
  async getOutcomeScoreSummary(outcomeId) {
    const result = await queryPostgres<OutcomeSummaryRow>(
      `
        select
          coalesce(sum(scores.score), 0) as total_score,
          coalesce(sum(items.max_score), 0) as max_score,
          (
            select count(*)
            from public.outcome_evidence evidence
            where evidence.outcome_id = $1
          ) as evidence_count
        from public.evaluation_item_scores scores
        join public.rubric_items items on items.id = scores.rubric_item_id
        where items.outcome_ids @> array[$1]::text[]
      `,
      [outcomeId],
    );
    const row = result.rows[0];
    const totalScore = toNumber(row?.total_score);
    const maxScore = toNumber(row?.max_score);
    const evidenceCount = toNumber(row?.evidence_count);

    return {
      totalScore,
      maxScore,
      averageRate: maxScore ? Math.round((totalScore / maxScore) * 100) : 0,
      evidenceCount,
    } satisfies OutcomeScoreSummary;
  },
};

export const postgresLmsContentMappingRepository: LmsContentMappingRepository = {
  async listMappings(query) {
    const values: unknown[] = [];
    const filters: string[] = [];

    if (query?.cohortId) {
      values.push(query.cohortId);
      filters.push(`cohort_id = $${values.length}`);
    }
    if (query?.learningPieceId) {
      values.push(query.learningPieceId);
      filters.push(`learning_piece_id = $${values.length}`);
    }
    if (query?.lmsContentId) {
      values.push(query.lmsContentId);
      filters.push(`lms_content_id = $${values.length}`);
    }
    if (query?.status) {
      values.push(query.status);
      filters.push(`status = $${values.length}`);
    }

    values.push(query?.limit ?? 100);
    const whereClause = filters.length ? ` where ${filters.join(" and ")}` : "";
    const result = await queryPostgres<LmsContentMappingRow>(
      `${lmsContentMappingSelect}${whereClause} order by created_at desc limit $${values.length}`,
      values,
    );

    return result.rows
      .map((row) => mapPostgresLmsContentMapping(row))
      .filter((mapping): mapping is LmsContentMapping => Boolean(mapping));
  },
  async getMappingById(mappingId) {
    const result = await queryPostgres<LmsContentMappingRow>(
      `${lmsContentMappingSelect} where id = $1 limit 1`,
      [mappingId],
    );

    return result.rows[0] ? mapPostgresLmsContentMapping(result.rows[0]) ?? undefined : undefined;
  },
  async getMappingByLearningPiece(input) {
    const result = await queryPostgres<LmsContentMappingRow>(
      `${lmsContentMappingSelect}
       where cohort_id = $1 and learning_piece_id = $2
       limit 1`,
      [input.cohortId, input.learningPieceId],
    );

    return result.rows[0] ? mapPostgresLmsContentMapping(result.rows[0]) ?? undefined : undefined;
  },
  async createMapping(input) {
    return transactionPostgres(async (query) => {
      const result = await query<LmsContentMappingRow>(
        `
          insert into public.lms_content_mappings (
            cohort_id,
            module_id,
            content_id,
            learning_piece_id,
            lms_content_id,
            lms_course_round_id,
            content_group,
            content_type,
            required,
            activation_rule,
            status,
            created_by
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          returning
            id,
            cohort_id,
            module_id,
            content_id,
            learning_piece_id,
            lms_content_id,
            lms_course_round_id,
            content_group,
            content_type,
            required,
            activation_rule,
            status,
            created_by,
            created_at,
            updated_at
        `,
        [
          input.cohortId,
          input.moduleId,
          input.contentId,
          input.learningPieceId,
          input.lmsContentId,
          input.lmsCourseRoundId ?? null,
          input.contentGroup,
          input.contentType,
          input.required,
          input.activationRule,
          input.status,
          isUuid(input.createdBy) ? input.createdBy : null,
        ],
      );
      const mapping = result.rows[0] ? mapPostgresLmsContentMapping(result.rows[0]) : null;
      if (!mapping) {
        throw new Error("Failed to create LMS content mapping");
      }
      const auditLog = input.audit
        ? await createPostgresAuditLog(
            {
              ...input.audit,
              event: "LMS 콘텐츠 매핑 생성",
              targetType: "lms_content_mapping",
              targetId: mapping.id,
              targetLabel: `${mapping.learningPieceId} -> ${mapping.lmsContentId}`,
              severity: "notice",
              metadata: mergeAuditMetadata(input.audit, {
                cohortId: mapping.cohortId,
                learningPieceId: mapping.learningPieceId,
                lmsContentId: mapping.lmsContentId,
                lmsCourseRoundId: mapping.lmsCourseRoundId,
                status: mapping.status,
              }),
            },
            query,
          )
        : undefined;

      return {
        data: mapping,
        auditLogId: auditLog?.id,
      };
    });
  },
  async updateMappingStatus(input) {
    return transactionPostgres(async (query) => {
      const result = await query<LmsContentMappingRow>(
        `
          update public.lms_content_mappings
          set status = $2
          where id = $1
          returning
            id,
            cohort_id,
            module_id,
            content_id,
            learning_piece_id,
            lms_content_id,
            lms_course_round_id,
            content_group,
            content_type,
            required,
            activation_rule,
            status,
            created_by,
            created_at,
            updated_at
        `,
        [input.mappingId, input.status],
      );

      const mapping = result.rows[0]
        ? mapPostgresLmsContentMapping(result.rows[0]) ?? undefined
        : undefined;
      if (!mapping) {
        return undefined;
      }
      const auditLog = input.audit
        ? await createPostgresAuditLog(
            {
              ...input.audit,
              event: "LMS 콘텐츠 매핑 상태 변경",
              targetType: "lms_content_mapping",
              targetId: mapping.id,
              targetLabel: `${mapping.learningPieceId} -> ${mapping.status}`,
              severity: "notice",
              metadata: mergeAuditMetadata(input.audit, {
                cohortId: mapping.cohortId,
                learningPieceId: mapping.learningPieceId,
                lmsContentId: mapping.lmsContentId,
                lmsCourseRoundId: mapping.lmsCourseRoundId,
                status: mapping.status,
              }),
            },
            query,
          )
        : undefined;

      return {
        data: mapping,
        auditLogId: auditLog?.id,
      };
    });
  },
};

export const postgresAdminRepository: AdminRepository = {
  ...mockRepositories.admin,
  async listAuditLogs(query) {
    const result = await queryPostgres<LogEventRow>(
      `${auditLogSelect} order by occurred_at desc, id desc limit $1`,
      [query?.limit ?? 100],
    );

    return result.rows
      .map((row) => mapPostgresLogEvent(row))
      .filter((event): event is LogEvent => Boolean(event));
  },
  async listAccessLogs(query) {
    const result = await queryPostgres<LogEventRow>(
      `${accessLogSelect} order by occurred_at desc, id desc limit $1`,
      [query?.limit ?? 100],
    );

    return result.rows
      .map((row) => mapPostgresLogEvent(row))
      .filter((event): event is LogEvent => Boolean(event));
  },
  async createAuditLog(input) {
    return createPostgresAuditLog(input);
  },
  async createAccessLog(input) {
    return createPostgresAccessLog(input);
  },
};

export const postgresRepositories = {
  ...mockRepositories,
  users: postgresUserRepository,
  learning: postgresLearningRepository,
  cohorts: postgresCohortRepository,
  artifacts: postgresArtifactRepository,
  evaluations: postgresEvaluationRepository,
  admin: postgresAdminRepository,
  lms: {
    ...mockRepositories.lms,
    contentMappings: postgresLmsContentMappingRepository,
  },
};
