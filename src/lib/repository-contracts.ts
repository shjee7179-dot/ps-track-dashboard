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

export type UserRepository = {
  listUsers(query?: ListQuery): RepositoryResult<User[]>;
  getUserById(userId: string): RepositoryResult<User | undefined>;
  listRoleAssignments(userId?: string): RepositoryResult<RoleAssignment[]>;
};

export type LearningRepository = {
  listModules(query?: ListQuery): RepositoryResult<Module[]>;
  listContents(query?: ListQuery): RepositoryResult<Content[]>;
  listLearningPieces(query?: ListQuery): RepositoryResult<LearningPiece[]>;
  getLearningPieceById(learningPieceId: string): RepositoryResult<LearningPiece | undefined>;
  listStudentLearningPieceStatuses(query?: ListQuery): RepositoryResult<StudentLearningPieceStatus[]>;
  updateStudentLearningPieceStatus(
    statusId: string,
    status: StudentLearningPieceStatus["status"],
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
  }): RepositoryResult<MutationResult<Submission>>;
  createFeedback(input: {
    artifactId?: string;
    mentoringSessionId?: string;
    authorId: string;
    body: string;
    targetUserId?: string;
    targetTeamId?: string;
  }): RepositoryResult<MutationResult<Feedback>>;
};

export type EvaluationRepository = {
  listRubrics(): RepositoryResult<Rubric[]>;
  listRubricItems(rubricId: string): RepositoryResult<RubricItem[]>;
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
  }): RepositoryResult<MutationResult<Evaluation>>;
  listLearningOutcomes(): RepositoryResult<LearningOutcome[]>;
};

export type OperationsRepository = {
  listMentoringSessions(query?: ListQuery): RepositoryResult<MentoringSession[]>;
  getMentoringSessionById(sessionId: string): RepositoryResult<MentoringSession | undefined>;
  updateMentoringSessionRecord(input: {
    sessionId: string;
    status: MentoringSession["status"];
    notes: string;
    nextActions: string[];
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
};
