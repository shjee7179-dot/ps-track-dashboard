import { artifacts, feedback, submissions, teams, users } from "@/lib/mock-data";
import type { Artifact, ArtifactStatus } from "@/lib/types";

export function getArtifactById(artifactId: string) {
  return artifacts.find((artifact) => artifact.id === artifactId);
}

export function getArtifactOwnerName(artifact: Artifact) {
  if (artifact.ownerType === "student") {
    return users.find((user) => user.id === artifact.ownerId)?.name ?? artifact.ownerId;
  }
  return teams.find((team) => team.id === artifact.ownerId)?.name ?? artifact.ownerId;
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
