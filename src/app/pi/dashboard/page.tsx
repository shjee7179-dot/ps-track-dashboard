import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EvaluationSummaryCard } from "@/components/evaluation";
import { Card, Stat, StatusBadge } from "@/components/ui";
import {
  getArtifactOwnerName,
  getOutcomeScoreSummary,
  getProgramEvaluationSummary,
  learningOutcomes,
} from "@/lib/domain";
import { mockRepositories } from "@/lib/mock-repositories";

export default async function PiDashboardPage() {
  const [artifacts, evaluations, riskSignals] = await Promise.all([
    mockRepositories.artifacts.listArtifacts(),
    mockRepositories.evaluations.listEvaluations(),
    mockRepositories.operations.listRiskSignals(),
  ]);
  const artifactById = new Map(artifacts.map((artifact) => [artifact.id, artifact]));
  const summary = getProgramEvaluationSummary();
  const highestRisks = riskSignals.filter((risk) => risk.actionStatus !== "resolved");

  return (
    <AppShell title="PI 성과·품질 대시보드" eyebrow="PI Dashboard">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="평가 완료" value={`${summary.evaluationCount}건`} tone="teal" />
        <Stat label="평균 달성률" value={`${summary.averageRate}%`} />
        <Stat label="평가 대기" value={`${summary.pendingEvaluationCount}건`} tone="amber" />
        <Stat label="성과 지표" value={`${summary.outcomeCount}개`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card title="성과 달성 요약" subtitle="루브릭 항목 점수와 성과 증거 기반 mock 집계">
          <div className="space-y-3">
            {learningOutcomes.map((outcome) => {
              const outcomeSummary = getOutcomeScoreSummary(outcome.id);
              return (
                <Link
                  key={outcome.id}
                  href={`/outcomes/${outcome.id}`}
                  className="block rounded-lg border border-stone-200 p-4 transition hover:border-teal-700"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium text-teal-800">{outcome.code}</p>
                      <p className="mt-1 font-medium text-stone-950">{outcome.title}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge>{outcomeSummary.averageRate}%</StatusBadge>
                      <StatusBadge>증거 {outcomeSummary.evidenceCount}</StatusBadge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card title="산출물 품질 요약">
          <div className="space-y-3">
            {artifacts.map((artifact) => {
              const artifactEvaluations = evaluations.filter(
                (evaluation) => evaluation.artifactId === artifact.id,
              );
              const latest = artifactEvaluations.at(-1);
              return (
                <Link
                  key={artifact.id}
                  href={`/artifacts/${artifact.id}/evaluation`}
                  className="block rounded-lg border border-stone-200 p-4 transition hover:border-teal-700"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-stone-950">{artifact.title}</p>
                      <p className="mt-1 text-sm text-stone-600">{getArtifactOwnerName(artifact)}</p>
                    </div>
                    <StatusBadge>
                      {latest ? `${latest.totalScore}/${latest.maxScore}` : "평가 대기"}
                    </StatusBadge>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          <h2 className="mb-4 text-base font-semibold text-stone-950">최근 평가</h2>
          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <div key={evaluation.id}>
                <p className="mb-2 text-sm font-medium text-stone-950">
                  {artifactById.get(evaluation.artifactId)?.title}
                </p>
                <EvaluationSummaryCard evaluation={evaluation} />
              </div>
            ))}
          </div>
        </section>

        <Card title="운영 리스크 요약">
          <div className="space-y-3">
            {highestRisks.map((risk) => (
              <Link
                key={risk.id}
                href="/operations/risks"
                className="block rounded-lg border border-stone-200 p-4 transition hover:border-teal-700"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-sm text-stone-700">{risk.actionNote}</p>
                  <StatusBadge>{risk.severity}</StatusBadge>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
