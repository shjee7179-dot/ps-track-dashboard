import type { Artifact } from "@/lib/types";

export type * from "@/lib/types";

import {
  contents,
  evaluationItemScores,
  evaluations,
  learningOutcomes,
  modules,
  outcomeEvidence,
  programTemplates,
  rubrics,
  rubricItems,
  scheduleTemplates,
  surveyResponses,
  surveys,
  teams,
  users,
} from "@/lib/mock-data";
import { getLearningPieceById } from "@/lib/journeys";

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

export {
  getJourneySummary,
  getLearningPieceById,
  getStatusLabel,
  getStudentJourney,
} from "@/lib/journeys";

export {
  getArtifactById,
  getArtifactFeedback,
  getArtifactOwnerName,
  getArtifactStatusLabel,
  getArtifactSubmissions,
} from "@/lib/artifacts";

export function getStudentById(studentId: string) {
  return users.find((user) => user.id === studentId && user.defaultRole === "student");
}

export function getModuleById(moduleId: string) {
  return modules.find((module) => module.id === moduleId);
}

export function getContentById(contentId?: string) {
  return contents.find((content) => content.id === contentId);
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
