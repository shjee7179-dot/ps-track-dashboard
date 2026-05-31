import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { EvaluationItemScores, EvaluationSummaryCard, RubricPreview } from "@/components/evaluation";
import { Card, Stat } from "@/components/ui";
import {
  getArtifactById,
  getArtifactEvaluations,
  getArtifactOwnerName,
  getArtifactStatusLabel,
  getRubricForArtifact,
} from "@/lib/domain";

export default async function ArtifactEvaluationPage({
  params,
}: {
  params: Promise<{ artifactId: string }>;
}) {
  const { artifactId } = await params;
  const artifact = getArtifactById(artifactId);
  if (!artifact) notFound();

  const rubric = getRubricForArtifact(artifact);
  const evaluations = getArtifactEvaluations(artifact.id);
  const latestEvaluation = evaluations.at(-1);

  return (
    <AppShell title={`${artifact.title} 루브릭 평가`} eyebrow="Rubric Evaluation">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="소유자" value={getArtifactOwnerName(artifact)} tone="teal" />
        <Stat label="산출물 상태" value={getArtifactStatusLabel(artifact.status)} />
        <Stat label="평가 수" value={`${evaluations.length}건`} tone="amber" />
        <Stat label="적용 루브릭" value={rubric ? "활성" : "미지정"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {rubric ? (
          <RubricPreview rubric={rubric} />
        ) : (
          <Card title="적용 루브릭 없음">
            <p className="text-sm text-stone-600">산출물 유형에 연결된 활성 루브릭이 없습니다.</p>
          </Card>
        )}
        {latestEvaluation ? (
          <div className="space-y-6">
            <EvaluationSummaryCard evaluation={latestEvaluation} />
            <EvaluationItemScores evaluation={latestEvaluation} />
          </div>
        ) : (
          <Card title="평가 작성 폼" subtitle="Sprint 4 mock form, 저장 동작은 이후 persistence에서 연결">
            <div className="grid gap-3 text-sm text-stone-600">
              <p>항목별 점수, 평가자, 종합 코멘트를 저장할 수 있는 구조로 준비되어 있습니다.</p>
              <p>권한 범위 검사는 role+scope 정책과 서버 액션 연결 시 적용합니다.</p>
            </div>
          </Card>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/artifacts/${artifact.id}`}
          className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700"
        >
          산출물 상세
        </Link>
        <Link
          href="/outcomes"
          className="rounded-md border border-teal-700 bg-teal-700 px-3 py-2 text-sm font-medium text-white"
        >
          학습성과 보기
        </Link>
      </div>
    </AppShell>
  );
}
