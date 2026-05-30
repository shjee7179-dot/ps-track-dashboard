import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import {
  getArtifactById,
  getArtifactFeedback,
  getArtifactOwnerName,
  getArtifactStatusLabel,
  getUserById,
} from "@/lib/domain";

export default async function ArtifactReviewPage({
  params,
}: {
  params: Promise<{ artifactId: string }>;
}) {
  const { artifactId } = await params;
  const artifact = getArtifactById(artifactId);
  if (!artifact) notFound();
  const feedback = getArtifactFeedback(artifact.id);

  return (
    <AppShell title={`${artifact.title} 리뷰`} eyebrow="Artifact Review">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="소유자" value={getArtifactOwnerName(artifact)} tone="teal" />
        <Stat label="상태" value={getArtifactStatusLabel(artifact.status)} />
        <Stat label="피드백" value={`${feedback.length}건`} tone="amber" />
      </div>
      <Card title="리뷰 큐" subtitle="Sprint 2에서는 피드백 흐름과 후속 액션을 mock으로 표시">
        <div className="space-y-4">
          {feedback.map((item) => (
            <div key={item.id} className="rounded-lg border border-stone-200 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm text-stone-700">{item.body}</p>
                <StatusBadge>{item.status === "open" ? "열림" : "해결"}</StatusBadge>
              </div>
              <p className="mt-2 text-xs text-stone-500">
                {getUserById(item.authorId)?.name} / {item.createdAt}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
