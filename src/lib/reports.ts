import {
  artifacts,
  evaluationItemScores,
  evaluations,
  learningOutcomes,
  learningPieces,
  outcomeEvidence,
  rubricItems,
  studentLearningPieceStatuses,
  teams,
  users,
} from "@/lib/mock-data";
import type { Artifact, ArtifactStatus, LearningPieceStatus, ReportExport } from "@/lib/types";

function getStudentName(studentId: string) {
  return users.find((user) => user.id === studentId && user.defaultRole === "student")?.name ?? studentId;
}

function getTeamName(teamId: string) {
  return teams.find((team) => team.id === teamId)?.name ?? teamId;
}

function getLearningPieceTitle(learningPieceId: string) {
  return learningPieces.find((piece) => piece.id === learningPieceId)?.title ?? learningPieceId;
}

function getStatusLabel(status: LearningPieceStatus) {
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

function getArtifactOwnerName(artifact: Artifact) {
  if (artifact.ownerType === "student") {
    return getStudentName(artifact.ownerId);
  }
  return getTeamName(artifact.ownerId);
}

function getArtifactStatusLabel(status: ArtifactStatus) {
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

function getOutcomeScoreSummary(outcomeId: string) {
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

export function getParticipationReportRows() {
  return studentLearningPieceStatuses.map((status) => ({
    student: getStudentName(status.studentId),
    learningPiece: getLearningPieceTitle(status.learningPieceId),
    status: getStatusLabel(status.status),
    updatedAt: status.updatedAt,
  }));
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
