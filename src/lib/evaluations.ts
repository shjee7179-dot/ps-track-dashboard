import { evaluationItemScores, evaluations, rubrics, rubricItems } from "@/lib/mock-data";
import type { Artifact } from "@/lib/types";

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
