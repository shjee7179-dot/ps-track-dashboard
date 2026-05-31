export type * from "@/lib/types";

import {
  contents,
  modules,
  programTemplates,
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

export {
  getArtifactEvaluations,
  getEvaluationById,
  getEvaluationItemScores,
  getRubricById,
  getRubricForArtifact,
  getRubricItems,
} from "@/lib/evaluations";

export {
  getLearningOutcomeById,
  getOutcomeEvidence,
  getOutcomeScoreSummary,
  getStudentOutcomeEvidence,
} from "@/lib/outcomes";

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
