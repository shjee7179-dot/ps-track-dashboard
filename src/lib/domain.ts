import type {
  Artifact,
  ArtifactStatus,
  LearningPiece,
  LearningPieceStatus,
  StudentLearningPieceStatus,
} from "@/lib/types";

export type * from "@/lib/types";

import {
  artifacts,
  contents,
  evaluationItemScores,
  evaluations,
  feedback,
  learningOutcomes,
  learningPieces,
  modules,
  outcomeEvidence,
  programTemplates,
  rubrics,
  rubricItems,
  scheduleTemplates,
  studentLearningPieceStatuses,
  submissions,
  surveyResponses,
  surveys,
  teams,
  users,
} from "@/lib/mock-data";

export {
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
  programTemplates,
  pwaQualityChecks,
  pwaSettings,
  reminderCandidates,
  reportExports,
  riskSignals,
  roleAssignments,
  routeAccessPolicies,
  rubrics,
  rubricItems,
  scheduleTemplates,
  studentLearningPieceStatuses,
  submissions,
  systemSettings,
  surveyResponses,
  surveys,
  teams,
  users,
} from "@/lib/mock-data";

export {
  canAccess,
  canAccessPath,
  canAccessRoute,
  getAccessibleNavItems,
  getDefaultAssignment,
  getRouteAccessPolicy,
} from "@/lib/permissions";

export {
  getArtifactReportRows,
  getCsvPreview,
  getParticipationReportRows,
  getProgramEvaluationSummary,
} from "@/lib/reports";

export {
  getMentoringSessionById,
  getMentoringStatusLabel,
  getMentoringTargetName,
} from "@/lib/mentoring";

export {
  getReminderStatusLabel,
  getRiskSignalById,
  getRiskTargetName,
  getRiskTypeLabel,
} from "@/lib/risks";

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
