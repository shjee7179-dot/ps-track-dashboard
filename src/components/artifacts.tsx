import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import {
  getArtifactOwnerName,
  getArtifactStatusLabel,
  getLearningPieceById,
  type Artifact,
} from "@/lib/domain";

export function ArtifactCard({ artifact }: { artifact: Artifact }) {
  const learningPiece = artifact.learningPieceId
    ? getLearningPieceById(artifact.learningPieceId)
    : undefined;

  return (
    <Link
      href={`/artifacts/${artifact.id}`}
      className="block rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition hover:border-teal-700"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium text-teal-800">
            {artifact.ownerType === "student" ? "개인 산출물" : "팀 산출물"} /{" "}
            {getArtifactOwnerName(artifact)}
          </p>
          <h2 className="mt-1 text-base font-semibold text-stone-950">{artifact.title}</h2>
          <p className="mt-2 text-sm text-stone-600">
            연결 학습피스: {learningPiece?.title ?? "없음"}
          </p>
        </div>
        <StatusBadge>{getArtifactStatusLabel(artifact.status)}</StatusBadge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-500">
        <span>유형 {artifact.artifactType}</span>
        <span>마감 {artifact.dueAt}</span>
        <span>{artifact.finalConfirmed ? "최종 확정" : "진행 중"}</span>
      </div>
    </Link>
  );
}
