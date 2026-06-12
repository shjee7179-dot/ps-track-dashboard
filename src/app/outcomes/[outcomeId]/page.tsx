import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { mockRepositories } from "@/lib/mock-repositories";
import { repositories } from "@/lib/repositories";
import type { Artifact, Evaluation, OutcomeEvidence } from "@/lib/types";

const sourceLabels = {
  learning_piece: "학습피스",
  artifact: "산출물",
  evaluation: "평가",
  feedback: "피드백",
};

function getEvidenceSourceName(
  evidence: OutcomeEvidence,
  artifactById: Map<string, Artifact>,
  evaluationById: Map<string, Evaluation>,
) {
  if (evidence.sourceType === "artifact") {
    return artifactById.get(evidence.sourceId)?.title ?? evidence.sourceId;
  }
  if (evidence.sourceType === "evaluation") {
    const evaluation = evaluationById.get(evidence.sourceId);
    return evaluation
      ? (artifactById.get(evaluation.artifactId)?.title ?? evidence.sourceId)
      : evidence.sourceId;
  }
  return evidence.sourceId;
}

export default async function OutcomeDetailPage({
  params,
}: {
  params: Promise<{ outcomeId: string }>;
}) {
  const { outcomeId } = await params;
  const [outcome, rubricItems, evidence, summary, artifacts, evaluations, users] = await Promise.all([
    repositories.evaluations.getLearningOutcomeById(outcomeId),
    repositories.evaluations.listRubricItems(),
    repositories.evaluations.listOutcomeEvidence(outcomeId),
    repositories.evaluations.getOutcomeScoreSummary(outcomeId),
    repositories.artifacts.listArtifacts(),
    repositories.evaluations.listEvaluations(),
    mockRepositories.users.listUsers(),
  ]);
  if (!outcome) notFound();

  const mappedItems = rubricItems.filter((item) => item.outcomeIds.includes(outcome.id));
  const artifactById = new Map(artifacts.map((artifact) => [artifact.id, artifact]));
  const evaluationById = new Map(evaluations.map((evaluation) => [evaluation.id, evaluation]));
  const userById = new Map(users.map((user) => [user.id, user]));

  return (
    <AppShell title={outcome.title} eyebrow={`${outcome.code} / Outcome Detail`}>
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="평균 달성률" value={`${summary.averageRate}%`} tone="teal" />
        <Stat label="성과 증거" value={`${summary.evidenceCount}건`} />
        <Stat label="루브릭 항목" value={`${mappedItems.length}개`} tone="amber" />
        <Stat label="점수 합계" value={`${summary.totalScore}/${summary.maxScore}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card title="성과 정의">
          <p className="text-sm text-stone-700">{outcome.description}</p>
          <div className="mt-4">
            <StatusBadge>{outcome.category}</StatusBadge>
          </div>
        </Card>

        <Card title="루브릭 매핑">
          <div className="space-y-3">
            {mappedItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-stone-200 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-stone-950">{item.title}</p>
                    <p className="mt-1 text-sm text-stone-600">{item.description}</p>
                  </div>
                  <StatusBadge>{item.maxScore}점</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="학생별 성과 증거">
          <div className="space-y-3">
            {evidence.map((item) => (
              <div key={item.id} className="rounded-lg border border-stone-200 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-stone-950">{item.evidenceLabel}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {userById.get(item.studentId)?.name ?? item.studentId} /{" "}
                      {getEvidenceSourceName(item, artifactById, evaluationById)}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">{item.recordedAt}</p>
                  </div>
                  <StatusBadge>{sourceLabels[item.sourceType]}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Link
          href="/outcomes"
          className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700"
        >
          성과 목록
        </Link>
      </div>
    </AppShell>
  );
}
