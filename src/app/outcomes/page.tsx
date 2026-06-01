import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { mockRepositories } from "@/lib/mock-repositories";
import type { LearningOutcome } from "@/lib/types";

const categoryLabels: Record<LearningOutcome["category"], string> = {
  research_foundation: "연구 기초",
  research_design: "연구 설계",
  communication: "커뮤니케이션",
  career: "진로 성찰",
};

export default async function OutcomesPage() {
  const [learningOutcomes, outcomeEvidence, rubricItems] = await Promise.all([
    mockRepositories.evaluations.listLearningOutcomes(),
    mockRepositories.evaluations.listOutcomeEvidence(),
    mockRepositories.evaluations.listRubricItems(),
  ]);
  const summaries = await Promise.all(
    learningOutcomes.map(async (outcome) => [
      outcome.id,
      await mockRepositories.evaluations.getOutcomeScoreSummary(outcome.id),
    ] as const),
  );
  const summaryByOutcomeId = new Map(summaries);

  return (
    <AppShell title="학습성과" eyebrow="Learning Outcomes">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="성과 지표" value={`${learningOutcomes.length}개`} tone="teal" />
        <Stat label="성과 증거" value={`${outcomeEvidence.length}건`} />
        <Stat label="루브릭 매핑" value={`${rubricItems.length}개 항목`} tone="amber" />
        <Stat label="자동 집계" value="준비됨" />
      </div>

      <Card title="학습성과 목록" subtitle="모듈, 학습피스, 산출물, 루브릭 항목과 연결되는 성과 객체">
        <div className="grid gap-3">
          {learningOutcomes.map((outcome) => {
            const summary = summaryByOutcomeId.get(outcome.id);
            return (
              <Link
                key={outcome.id}
                href={`/outcomes/${outcome.id}`}
                className="rounded-lg border border-stone-200 p-4 transition hover:border-teal-700"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium text-teal-800">{outcome.code}</p>
                    <p className="mt-1 font-semibold text-stone-950">{outcome.title}</p>
                    <p className="mt-1 text-sm text-stone-600">{outcome.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <StatusBadge>{categoryLabels[outcome.category]}</StatusBadge>
                    <StatusBadge>{summary?.averageRate ?? 0}%</StatusBadge>
                    <StatusBadge>증거 {summary?.evidenceCount ?? 0}</StatusBadge>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </AppShell>
  );
}
