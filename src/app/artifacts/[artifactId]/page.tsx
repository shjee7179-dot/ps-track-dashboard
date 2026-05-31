import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import {
  getArtifactById,
  getArtifactEvaluations,
  getArtifactFeedback,
  getArtifactOwnerName,
  getArtifactStatusLabel,
  getArtifactSubmissions,
  getLearningPieceById,
  getUserById,
} from "@/lib/domain";

export default async function ArtifactDetailPage({
  params,
}: {
  params: Promise<{ artifactId: string }>;
}) {
  const { artifactId } = await params;
  const artifact = getArtifactById(artifactId);
  if (!artifact) notFound();

  const submissions = getArtifactSubmissions(artifact.id);
  const feedback = getArtifactFeedback(artifact.id);
  const evaluations = getArtifactEvaluations(artifact.id);
  const learningPiece = artifact.learningPieceId
    ? getLearningPieceById(artifact.learningPieceId)
    : undefined;

  return (
    <AppShell title={artifact.title} eyebrow="Artifact Detail">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="소유" value={getArtifactOwnerName(artifact)} tone="teal" />
        <Stat label="상태" value={getArtifactStatusLabel(artifact.status)} />
        <Stat label="제출 버전" value={`${submissions.length}개`} />
        <Stat label="평가" value={`${evaluations.length}건`} tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="제출 이력" subtitle="학생 또는 팀의 산출물 제출 버전">
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div key={submission.id} className="border-b border-stone-100 pb-3 last:border-0">
                <p className="font-medium text-stone-950">v{submission.version}</p>
                <p className="mt-1 text-sm text-stone-600">{submission.note}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {submission.submittedAt} / {getUserById(submission.submittedBy)?.name}
                </p>
              </div>
            ))}
            {submissions.length === 0 ? (
              <p className="text-sm text-stone-500">아직 제출 이력이 없습니다.</p>
            ) : null}
          </div>
        </Card>
        <Card title="연결 정보">
          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="text-stone-500">연결 학습피스</dt>
              <dd className="mt-1 font-medium text-stone-950">
                {learningPiece?.title ?? "미지정"}
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">성과 태그</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {artifact.outcomeTags.map((tag) => (
                  <StatusBadge key={tag}>{tag}</StatusBadge>
                ))}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="피드백">
          <div className="space-y-3">
            {feedback.map((item) => (
              <div key={item.id} className="border-b border-stone-100 pb-3 last:border-0">
                <p className="text-sm text-stone-700">{item.body}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {getUserById(item.authorId)?.name} / {item.createdAt}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/artifacts/${artifact.id}/review`}
          className="rounded-md border border-teal-700 bg-teal-700 px-3 py-2 text-sm font-medium text-white"
        >
          산출물 리뷰
        </Link>
        <Link
          href={`/artifacts/${artifact.id}/evaluation`}
          className="rounded-md border border-stone-900 bg-stone-900 px-3 py-2 text-sm font-medium text-white"
        >
          루브릭 평가
        </Link>
        <Link
          href="/artifacts"
          className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700"
        >
          목록으로
        </Link>
      </div>
    </AppShell>
  );
}
