import type {
  ActivityLog,
  Artifact,
  Cohort,
  Content,
  Evaluation,
  EvaluationItemScore,
  Feedback,
  LearningOutcome,
  LearningPiece,
  LogEvent,
  MentoringSession,
  Module,
  Notice,
  OutcomeEvidence,
  ReminderCandidate,
  RiskSignal,
  RoleAssignment,
  Rubric,
  RubricItem,
  StudentLearningPieceStatus,
  Submission,
  Survey,
  SurveyResponse,
  Team,
  User,
} from "@/lib/types";
import type { LmsContentMappingRepository } from "@/lib/lms/contracts";

export type RepositoryResult<T> = Promise<T>;

export type ListQuery = {
  cohortId?: string;
  studentId?: string;
  teamId?: string;
  limit?: number;
  cursor?: string;
};

export type MutationResult<T> = {
  data: T;
  auditLogId?: string;
};

export type AuditWriteContext = {
  actorId: string;
  actorLabel: string;
  metadata?: Record<string, unknown>;
};

export type AuditLogDraft = AuditWriteContext & {
  event: string;
  targetType: string;
  targetId: string;
  targetLabel: string;
  severity?: LogEvent["severity"];
};

export type AccessLogDraft = AuditWriteContext & {
  event: string;
  targetType: string;
  targetId: string;
  targetLabel: string;
  severity?: LogEvent["severity"];
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
};

export type StudentJourneyItem = {
  status: StudentLearningPieceStatus;
  learningPiece: LearningPiece;
};

export type JourneySummary = {
  total: number;
  completed: number;
  delayed: number;
  needsAction: number;
  completionRate: number;
};

export type OutcomeScoreSummary = {
  totalScore: number;
  maxScore: number;
  averageRate: number;
  evidenceCount: number;
};

export type UserRepository = {
  listUsers(query?: ListQuery): RepositoryResult<User[]>;
  getUserById(userId: string): RepositoryResult<User | undefined>;
  getUserByExternalSubject(externalSubject: string): RepositoryResult<User | undefined>;
  listRoleAssignments(userId?: string): RepositoryResult<RoleAssignment[]>;
};

export type LearningRepository = {
  listModules(query?: ListQuery): RepositoryResult<Module[]>;
  listContents(query?: ListQuery): RepositoryResult<Content[]>;
  listLearningPieces(query?: ListQuery): RepositoryResult<LearningPiece[]>;
  getLearningPieceById(learningPieceId: string): RepositoryResult<LearningPiece | undefined>;
  listStudentLearningPieceStatuses(query?: ListQuery): RepositoryResult<StudentLearningPieceStatus[]>;
  listStudentJourney(studentId: string): RepositoryResult<StudentJourneyItem[]>;
  getJourneySummary(studentId: string): RepositoryResult<JourneySummary>;
  updateStudentLearningPieceStatus(
    statusId: string,
    status: StudentLearningPieceStatus["status"],
    audit?: AuditWriteContext,
  ): RepositoryResult<MutationResult<StudentLearningPieceStatus>>;
};

export type CohortRepository = {
  getActiveCohort(): RepositoryResult<Cohort | undefined>;
  listTeams(query?: ListQuery): RepositoryResult<Team[]>;
  getTeamById(teamId: string): RepositoryResult<Team | undefined>;
};

export type ArtifactRepository = {
  listArtifacts(query?: ListQuery): RepositoryResult<Artifact[]>;
  getArtifactById(artifactId: string): RepositoryResult<Artifact | undefined>;
  listSubmissions(artifactId: string): RepositoryResult<Submission[]>;
  listFeedback(artifactId: string): RepositoryResult<Feedback[]>;
  createSubmission(input: {
    artifactId: string;
    submittedBy: string;
    externalUrl?: string;
    fileName?: string;
    note: string;
    audit?: AuditWriteContext;
  }): RepositoryResult<MutationResult<Submission>>;
  createFeedback(input: {
    artifactId?: string;
    mentoringSessionId?: string;
    authorId: string;
    body: string;
    targetUserId?: string;
    targetTeamId?: string;
    audit?: AuditWriteContext;
  }): RepositoryResult<MutationResult<Feedback>>;
};

export type EvaluationRepository = {
  listRubrics(): RepositoryResult<Rubric[]>;
  listRubricItems(rubricId?: string): RepositoryResult<RubricItem[]>;
  listEvaluations(artifactId?: string): RepositoryResult<Evaluation[]>;
  getEvaluationById(evaluationId: string): RepositoryResult<Evaluation | undefined>;
  listEvaluationItemScores(evaluationId: string): RepositoryResult<EvaluationItemScore[]>;
  createEvaluation(input: {
    artifactId: string;
    rubricId: string;
    evaluatorId: string;
    overallComment: string;
    itemScores: Array<{
      rubricItemId: string;
      score: number;
      comment: string;
    }>;
    audit?: AuditWriteContext;
  }): RepositoryResult<MutationResult<Evaluation>>;
  listLearningOutcomes(): RepositoryResult<LearningOutcome[]>;
  getLearningOutcomeById(outcomeId: string): RepositoryResult<LearningOutcome | undefined>;
  listOutcomeEvidence(outcomeId?: string): RepositoryResult<OutcomeEvidence[]>;
  listStudentOutcomeEvidence(studentId: string): RepositoryResult<OutcomeEvidence[]>;
  getOutcomeScoreSummary(outcomeId: string): RepositoryResult<OutcomeScoreSummary>;
};

export type OperationsRepository = {
  listMentoringSessions(query?: ListQuery): RepositoryResult<MentoringSession[]>;
  getMentoringSessionById(sessionId: string): RepositoryResult<MentoringSession | undefined>;
  updateMentoringSessionRecord(input: {
    sessionId: string;
    status: MentoringSession["status"];
    notes: string;
    nextActions: string[];
    audit?: AuditWriteContext;
  }): RepositoryResult<MutationResult<MentoringSession>>;
  listRiskSignals(query?: ListQuery): RepositoryResult<RiskSignal[]>;
  listReminderCandidates(query?: ListQuery): RepositoryResult<ReminderCandidate[]>;
  updateRiskSignalStatus(
    riskSignalId: string,
    status: RiskSignal["actionStatus"],
  ): RepositoryResult<MutationResult<RiskSignal>>;
  updateReminderSendStatus(
    reminderId: string,
    status: ReminderCandidate["sendStatus"],
  ): RepositoryResult<MutationResult<ReminderCandidate>>;
};

export type SurveyRepository = {
  listSurveys(query?: ListQuery): RepositoryResult<Survey[]>;
  listSurveyResponses(surveyId: string): RepositoryResult<SurveyResponse[]>;
};

export type AdminRepository = {
  listActivityLogs(query?: ListQuery): RepositoryResult<ActivityLog[]>;
  listAuditLogs(query?: ListQuery): RepositoryResult<LogEvent[]>;
  listAccessLogs(query?: ListQuery): RepositoryResult<LogEvent[]>;
  createAuditLog(input: AuditLogDraft): RepositoryResult<LogEvent>;
  createAccessLog(input: AccessLogDraft): RepositoryResult<LogEvent>;
  listNotices(query?: ListQuery): RepositoryResult<Notice[]>;
  createNotice(input: {
    cohortId: string;
    title: string;
    body: string;
    targetScopeType: Notice["targetScopeType"];
    targetScopeId: string;
    createdBy: string;
  }): RepositoryResult<MutationResult<Notice>>;
};

export type AppRepositories = {
  users: UserRepository;
  learning: LearningRepository;
  cohorts: CohortRepository;
  artifacts: ArtifactRepository;
  evaluations: EvaluationRepository;
  operations: OperationsRepository;
  surveys: SurveyRepository;
  admin: AdminRepository;
  lms: {
    contentMappings: LmsContentMappingRepository;
  };
};
