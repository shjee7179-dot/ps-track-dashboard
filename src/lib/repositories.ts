import "server-only";

import { mockRepositories } from "@/lib/mock-repositories";
import type { AppRepositories } from "@/lib/repository-contracts";
import { supabaseRepositories } from "@/lib/supabase/repositories";

export type RepositoryProviderName = "mock" | "supabase";

export function getRepositoryProviderName(
  value = process.env.REPOSITORY_PROVIDER,
): RepositoryProviderName {
  if (!value || value === "mock") {
    return "mock";
  }
  if (value === "supabase") {
    return "supabase";
  }

  throw new Error(`Unsupported REPOSITORY_PROVIDER value: ${value}`);
}

export function getRepositories(): AppRepositories {
  return getRepositoryProviderName() === "supabase"
    ? supabaseRepositories
    : mockRepositories;
}

export const repositories: AppRepositories = {
  users: {
    listUsers(query) {
      return getRepositories().users.listUsers(query);
    },
    getUserById(userId) {
      return getRepositories().users.getUserById(userId);
    },
    getUserByExternalSubject(externalSubject) {
      return getRepositories().users.getUserByExternalSubject(externalSubject);
    },
    listRoleAssignments(userId) {
      return getRepositories().users.listRoleAssignments(userId);
    },
  },
  learning: {
    listModules(query) {
      return getRepositories().learning.listModules(query);
    },
    listContents(query) {
      return getRepositories().learning.listContents(query);
    },
    listLearningPieces(query) {
      return getRepositories().learning.listLearningPieces(query);
    },
    getLearningPieceById(learningPieceId) {
      return getRepositories().learning.getLearningPieceById(learningPieceId);
    },
    listStudentLearningPieceStatuses(query) {
      return getRepositories().learning.listStudentLearningPieceStatuses(query);
    },
    listStudentJourney(studentId) {
      return getRepositories().learning.listStudentJourney(studentId);
    },
    getJourneySummary(studentId) {
      return getRepositories().learning.getJourneySummary(studentId);
    },
    updateStudentLearningPieceStatus(statusId, status) {
      return getRepositories().learning.updateStudentLearningPieceStatus(statusId, status);
    },
  },
  cohorts: {
    getActiveCohort() {
      return getRepositories().cohorts.getActiveCohort();
    },
    listTeams(query) {
      return getRepositories().cohorts.listTeams(query);
    },
    getTeamById(teamId) {
      return getRepositories().cohorts.getTeamById(teamId);
    },
  },
  artifacts: {
    listArtifacts(query) {
      return getRepositories().artifacts.listArtifacts(query);
    },
    getArtifactById(artifactId) {
      return getRepositories().artifacts.getArtifactById(artifactId);
    },
    listSubmissions(artifactId) {
      return getRepositories().artifacts.listSubmissions(artifactId);
    },
    listFeedback(artifactId) {
      return getRepositories().artifacts.listFeedback(artifactId);
    },
    createSubmission(input) {
      return getRepositories().artifacts.createSubmission(input);
    },
    createFeedback(input) {
      return getRepositories().artifacts.createFeedback(input);
    },
  },
  evaluations: {
    listRubrics() {
      return getRepositories().evaluations.listRubrics();
    },
    listRubricItems(rubricId) {
      return getRepositories().evaluations.listRubricItems(rubricId);
    },
    listEvaluations(artifactId) {
      return getRepositories().evaluations.listEvaluations(artifactId);
    },
    getEvaluationById(evaluationId) {
      return getRepositories().evaluations.getEvaluationById(evaluationId);
    },
    listEvaluationItemScores(evaluationId) {
      return getRepositories().evaluations.listEvaluationItemScores(evaluationId);
    },
    createEvaluation(input) {
      return getRepositories().evaluations.createEvaluation(input);
    },
    listLearningOutcomes() {
      return getRepositories().evaluations.listLearningOutcomes();
    },
    getLearningOutcomeById(outcomeId) {
      return getRepositories().evaluations.getLearningOutcomeById(outcomeId);
    },
    listOutcomeEvidence(outcomeId) {
      return getRepositories().evaluations.listOutcomeEvidence(outcomeId);
    },
    listStudentOutcomeEvidence(studentId) {
      return getRepositories().evaluations.listStudentOutcomeEvidence(studentId);
    },
    getOutcomeScoreSummary(outcomeId) {
      return getRepositories().evaluations.getOutcomeScoreSummary(outcomeId);
    },
  },
  operations: {
    listMentoringSessions(query) {
      return getRepositories().operations.listMentoringSessions(query);
    },
    getMentoringSessionById(sessionId) {
      return getRepositories().operations.getMentoringSessionById(sessionId);
    },
    updateMentoringSessionRecord(input) {
      return getRepositories().operations.updateMentoringSessionRecord(input);
    },
    listRiskSignals(query) {
      return getRepositories().operations.listRiskSignals(query);
    },
    listReminderCandidates(query) {
      return getRepositories().operations.listReminderCandidates(query);
    },
    updateRiskSignalStatus(riskSignalId, status) {
      return getRepositories().operations.updateRiskSignalStatus(riskSignalId, status);
    },
    updateReminderSendStatus(reminderId, status) {
      return getRepositories().operations.updateReminderSendStatus(reminderId, status);
    },
  },
  surveys: {
    listSurveys(query) {
      return getRepositories().surveys.listSurveys(query);
    },
    listSurveyResponses(surveyId) {
      return getRepositories().surveys.listSurveyResponses(surveyId);
    },
  },
  admin: {
    listActivityLogs(query) {
      return getRepositories().admin.listActivityLogs(query);
    },
    listAuditLogs(query) {
      return getRepositories().admin.listAuditLogs(query);
    },
    listAccessLogs(query) {
      return getRepositories().admin.listAccessLogs(query);
    },
    listNotices(query) {
      return getRepositories().admin.listNotices(query);
    },
    createNotice(input) {
      return getRepositories().admin.createNotice(input);
    },
  },
};
