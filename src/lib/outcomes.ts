import { evaluationItemScores, learningOutcomes, outcomeEvidence, rubricItems } from "@/lib/mock-data";

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
