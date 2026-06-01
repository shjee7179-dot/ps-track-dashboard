import {
  accessLogs,
  activityLogs,
  artifacts,
  auditLogs,
  cohort2026,
  contents,
  evaluationItemScores,
  evaluations,
  feedback,
  learningOutcomes,
  learningPieces,
  mentoringSessions,
  modules,
  notices,
  outcomeEvidence,
  reminderCandidates,
  riskSignals,
  roleAssignments,
  rubrics,
  rubricItems,
  studentLearningPieceStatuses,
  submissions,
  surveyResponses,
  surveys,
  teams,
  users,
} from "@/lib/mock-data";
import type {
  AppRepositories,
  JourneySummary,
  ListQuery,
  MutationResult,
  OutcomeScoreSummary,
  StudentJourneyItem,
} from "@/lib/repository-contracts";
import type {
  Evaluation,
  EvaluationItemScore,
  Feedback,
  MentoringSession,
  Notice,
  ReminderCandidate,
  RiskSignal,
  StudentLearningPieceStatus,
  Submission,
} from "@/lib/types";

function applyLimit<T>(items: T[], query?: ListQuery) {
  return typeof query?.limit === "number" ? items.slice(0, query.limit) : items;
}

function nextMockId(prefix: string) {
  return `${prefix}-mock-${Date.now()}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function withAudit<T>(data: T): MutationResult<T> {
  return {
    data,
    auditLogId: nextMockId("audit"),
  };
}

function listStudentJourneyRows(studentId: string): StudentJourneyItem[] {
  return studentLearningPieceStatuses
    .filter((status) => status.studentId === studentId)
    .map((status) => ({
      status,
      learningPiece: learningPieces.find((piece) => piece.id === status.learningPieceId),
    }))
    .filter((item): item is StudentJourneyItem => Boolean(item.learningPiece));
}

function summarizeJourney(journey: StudentJourneyItem[]): JourneySummary {
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

function summarizeOutcome(outcomeId: string): OutcomeScoreSummary {
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
    evidenceCount: outcomeEvidence.filter((evidence) => evidence.outcomeId === outcomeId).length,
  };
}

export const mockRepositories: AppRepositories = {
  users: {
    async listUsers(query) {
      return applyLimit(users, query);
    },
    async getUserById(userId) {
      return users.find((user) => user.id === userId);
    },
    async listRoleAssignments(userId) {
      return userId
        ? roleAssignments.filter((assignment) => assignment.userId === userId)
        : roleAssignments;
    },
  },
  learning: {
    async listModules(query) {
      return applyLimit(modules, query);
    },
    async listContents(query) {
      return applyLimit(contents, query);
    },
    async listLearningPieces(query) {
      return applyLimit(learningPieces, query);
    },
    async getLearningPieceById(learningPieceId) {
      return learningPieces.find((piece) => piece.id === learningPieceId);
    },
    async listStudentLearningPieceStatuses(query) {
      const rows = studentLearningPieceStatuses.filter((status) =>
        query?.studentId ? status.studentId === query.studentId : true,
      );
      return applyLimit(rows, query);
    },
    async listStudentJourney(studentId) {
      return listStudentJourneyRows(studentId);
    },
    async getJourneySummary(studentId) {
      return summarizeJourney(listStudentJourneyRows(studentId));
    },
    async updateStudentLearningPieceStatus(statusId, status) {
      const existing = studentLearningPieceStatuses.find((item) => item.id === statusId);
      const updated: StudentLearningPieceStatus = {
        id: statusId,
        studentId: existing?.studentId ?? "student-001",
        learningPieceId: existing?.learningPieceId ?? "lp-001",
        status,
        updatedAt: today(),
        completedAt: status === "completed" ? today() : existing?.completedAt,
        note: existing?.note,
      };
      return withAudit(updated);
    },
  },
  cohorts: {
    async getActiveCohort() {
      return cohort2026;
    },
    async listTeams(query) {
      const rows = teams.filter((team) => (query?.cohortId ? team.cohortId === query.cohortId : true));
      return applyLimit(rows, query);
    },
    async getTeamById(teamId) {
      return teams.find((team) => team.id === teamId);
    },
  },
  artifacts: {
    async listArtifacts(query) {
      const rows = artifacts.filter((artifact) => {
        if (query?.cohortId && artifact.cohortId !== query.cohortId) return false;
        if (query?.studentId && artifact.ownerType === "student") {
          return artifact.ownerId === query.studentId;
        }
        if (query?.teamId && artifact.ownerType === "team") {
          return artifact.ownerId === query.teamId;
        }
        return true;
      });
      return applyLimit(rows, query);
    },
    async getArtifactById(artifactId) {
      return artifacts.find((artifact) => artifact.id === artifactId);
    },
    async listSubmissions(artifactId) {
      return submissions.filter((submission) => submission.artifactId === artifactId);
    },
    async listFeedback(artifactId) {
      return feedback.filter((item) => item.artifactId === artifactId);
    },
    async createSubmission(input) {
      const currentVersions = submissions
        .filter((submission) => submission.artifactId === input.artifactId)
        .map((submission) => submission.version);
      const nextVersion = currentVersions.length ? Math.max(...currentVersions) + 1 : 1;
      const submission: Submission = {
        id: nextMockId("submission"),
        artifactId: input.artifactId,
        submittedBy: input.submittedBy,
        version: nextVersion,
        submittedAt: today(),
        fileName: input.fileName,
        externalUrl: input.externalUrl,
        note: input.note,
      };
      return withAudit(submission);
    },
    async createFeedback(input) {
      const item: Feedback = {
        id: nextMockId("feedback"),
        artifactId: input.artifactId,
        mentoringSessionId: input.mentoringSessionId,
        authorId: input.authorId,
        targetUserId: input.targetUserId,
        targetTeamId: input.targetTeamId,
        body: input.body,
        status: "open",
        createdAt: today(),
      };
      return withAudit(item);
    },
  },
  evaluations: {
    async listRubrics() {
      return rubrics;
    },
    async listRubricItems(rubricId) {
      return rubricId ? rubricItems.filter((item) => item.rubricId === rubricId) : rubricItems;
    },
    async listEvaluations(artifactId) {
      return artifactId
        ? evaluations.filter((evaluation) => evaluation.artifactId === artifactId)
        : evaluations;
    },
    async getEvaluationById(evaluationId) {
      return evaluations.find((evaluation) => evaluation.id === evaluationId);
    },
    async listEvaluationItemScores(evaluationId) {
      return evaluationItemScores.filter((score) => score.evaluationId === evaluationId);
    },
    async createEvaluation(input) {
      const items = rubricItems.filter((item) => item.rubricId === input.rubricId);
      const maxScore = items.reduce((sum, item) => sum + item.maxScore, 0);
      const totalScore = input.itemScores.reduce((sum, item) => sum + item.score, 0);
      const evaluation: Evaluation = {
        id: nextMockId("evaluation"),
        artifactId: input.artifactId,
        rubricId: input.rubricId,
        evaluatorId: input.evaluatorId,
        evaluatedAt: today(),
        totalScore,
        maxScore,
        overallComment: input.overallComment,
        status: "submitted",
      };
      const scores: EvaluationItemScore[] = input.itemScores.map((item) => ({
        id: nextMockId("score"),
        evaluationId: evaluation.id,
        rubricItemId: item.rubricItemId,
        score: item.score,
        comment: item.comment,
      }));
      void scores;
      return withAudit(evaluation);
    },
    async listLearningOutcomes() {
      return learningOutcomes;
    },
    async getLearningOutcomeById(outcomeId) {
      return learningOutcomes.find((outcome) => outcome.id === outcomeId);
    },
    async listOutcomeEvidence(outcomeId) {
      return outcomeId
        ? outcomeEvidence.filter((evidence) => evidence.outcomeId === outcomeId)
        : outcomeEvidence;
    },
    async listStudentOutcomeEvidence(studentId) {
      return outcomeEvidence.filter((evidence) => evidence.studentId === studentId);
    },
    async getOutcomeScoreSummary(outcomeId) {
      return summarizeOutcome(outcomeId);
    },
  },
  operations: {
    async listMentoringSessions(query) {
      const rows = mentoringSessions.filter((session) => {
        if (query?.cohortId && session.cohortId !== query.cohortId) return false;
        if (query?.studentId && session.targetType === "student") {
          return session.targetId === query.studentId;
        }
        if (query?.teamId && session.targetType === "team") {
          return session.targetId === query.teamId;
        }
        return true;
      });
      return applyLimit(rows, query);
    },
    async getMentoringSessionById(sessionId) {
      return mentoringSessions.find((session) => session.id === sessionId);
    },
    async updateMentoringSessionRecord(input) {
      const existing = mentoringSessions.find((session) => session.id === input.sessionId);
      const updated: MentoringSession = {
        id: input.sessionId,
        cohortId: existing?.cohortId ?? cohort2026.id,
        targetType: existing?.targetType ?? "student",
        targetId: existing?.targetId ?? "student-001",
        mentorId: existing?.mentorId ?? "mentor-001",
        scheduledAt: existing?.scheduledAt ?? today(),
        status: input.status,
        externalMeetingUrl: existing?.externalMeetingUrl,
        notes: input.notes,
        linkedArtifactId: existing?.linkedArtifactId,
        nextActions: input.nextActions,
      };
      return withAudit(updated);
    },
    async listRiskSignals(query) {
      const rows = riskSignals.filter((risk) => {
        if (query?.cohortId && risk.cohortId !== query.cohortId) return false;
        if (query?.studentId && risk.targetType === "student") return risk.targetId === query.studentId;
        if (query?.teamId && risk.targetType === "team") return risk.targetId === query.teamId;
        return true;
      });
      return applyLimit(rows, query);
    },
    async listReminderCandidates(query) {
      const rows = reminderCandidates.filter((reminder) => {
        if (query?.studentId && reminder.targetType === "student") {
          return reminder.targetId === query.studentId;
        }
        if (query?.teamId && reminder.targetType === "team") {
          return reminder.targetId === query.teamId;
        }
        return true;
      });
      return applyLimit(rows, query);
    },
    async updateRiskSignalStatus(riskSignalId, status) {
      const existing = riskSignals.find((risk) => risk.id === riskSignalId);
      const updated: RiskSignal = {
        id: riskSignalId,
        cohortId: existing?.cohortId ?? cohort2026.id,
        targetType: existing?.targetType ?? "student",
        targetId: existing?.targetId ?? "student-001",
        riskType: existing?.riskType ?? "learning_piece_delay",
        severity: existing?.severity ?? "medium",
        relatedObjectType: existing?.relatedObjectType ?? "learning_piece",
        relatedObjectId: existing?.relatedObjectId ?? "lp-001",
        actionStatus: status,
        actionNote: existing?.actionNote ?? "mock repository status update",
      };
      return withAudit(updated);
    },
    async updateReminderSendStatus(reminderId, status) {
      const existing = reminderCandidates.find((reminder) => reminder.id === reminderId);
      const updated: ReminderCandidate = {
        id: reminderId,
        riskSignalId: existing?.riskSignalId ?? "risk-001",
        targetType: existing?.targetType ?? "student",
        targetId: existing?.targetId ?? "student-001",
        reason: existing?.reason ?? "mock repository reminder update",
        channel: existing?.channel ?? "manual",
        sendStatus: status,
        recommendedAt: existing?.recommendedAt ?? today(),
        sentAt: status === "sent" ? today() : existing?.sentAt,
      };
      return withAudit(updated);
    },
  },
  surveys: {
    async listSurveys(query) {
      const rows = surveys.filter((survey) => (query?.cohortId ? survey.cohortId === query.cohortId : true));
      return applyLimit(rows, query);
    },
    async listSurveyResponses(surveyId) {
      return surveyResponses.filter((response) => response.surveyId === surveyId);
    },
  },
  admin: {
    async listActivityLogs(query) {
      const rows = activityLogs.filter((log) => (query?.studentId ? log.studentId === query.studentId : true));
      return applyLimit(rows, query);
    },
    async listAuditLogs(query) {
      return applyLimit(auditLogs, query);
    },
    async listAccessLogs(query) {
      return applyLimit(accessLogs, query);
    },
    async listNotices(query) {
      const rows = notices.filter((notice) => (query?.cohortId ? notice.cohortId === query.cohortId : true));
      return applyLimit(rows, query);
    },
    async createNotice(input) {
      const notice: Notice = {
        id: nextMockId("notice"),
        cohortId: input.cohortId,
        title: input.title,
        body: input.body,
        targetScopeType: input.targetScopeType,
        targetScopeId: input.targetScopeId,
        publishedAt: today(),
        createdBy: input.createdBy,
        readCount: 0,
      };
      return withAudit(notice);
    },
  },
};
