import { learningPieces, studentLearningPieceStatuses } from "@/lib/mock-data";
import type { LearningPiece, LearningPieceStatus, StudentLearningPieceStatus } from "@/lib/types";

export function getLearningPieceById(learningPieceId: string) {
  return learningPieces.find((piece) => piece.id === learningPieceId);
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
