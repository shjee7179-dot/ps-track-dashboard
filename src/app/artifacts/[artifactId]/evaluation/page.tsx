import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { EvaluationItemScores, EvaluationSummaryCard, RubricPreview } from "@/components/evaluation";
import { Card, Stat } from "@/components/ui";
import { submitArtifactEvaluationAction } from "@/app/artifacts/[artifactId]/evaluation/actions";
import {
  getArtifactById,
  getArtifactEvaluations,
  getArtifactOwnerName,
  getArtifactStatusLabel,
  getRubricForArtifact,
  getRubricItems,
} from "@/lib/domain";

export default async function ArtifactEvaluationPage({
  params,
  searchParams,
}: {
  params: Promise<{ artifactId: string }>;
  searchParams: Promise<{ role?: string; update?: string; audit?: string }>;
}) {
  const { artifactId } = await params;
  const query = await searchParams;
  const artifact = getArtifactById(artifactId);
  if (!artifact) notFound();

  const rubric = getRubricForArtifact(artifact);
  const rubricItems = rubric ? getRubricItems(rubric.id) : [];
  const evaluations = getArtifactEvaluations(artifact.id);
  const latestEvaluation = evaluations.at(-1);
  const updateMessages: Record<string, string> = {
    submitted: "평가 제출 요청이 mock repository를 통해 접수되었습니다.",
    denied: "현재 역할/scope에서는 이 산출물을 평가할 수 없습니다.",
    invalid: "항목별 점수와 종합 코멘트를 확인해 주세요.",
    missing: "산출물 레코드를 찾을 수 없습니다.",
    "missing-rubric": "적용 가능한 루브릭 항목을 찾을 수 없습니다.",
  };
  const updateMessage = query.update ? updateMessages[query.update] : undefined;
  const defaultEvaluatorRole = artifact.ownerType === "team" ? "mentor" : "operator";

  return (
    <AppShell title={`${artifact.title} 루브릭 평가`} eyebrow="Rubric Evaluation">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="소유자" value={getArtifactOwnerName(artifact)} tone="teal" />
        <Stat label="산출물 상태" value={getArtifactStatusLabel(artifact.status)} />
        <Stat label="평가 수" value={`${evaluations.length}건`} tone="amber" />
        <Stat label="적용 루브릭" value={rubric ? "활성" : "미지정"} />
      </div>

      {updateMessage ? (
        <div className="mb-4 rounded-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
          {updateMessage}
          {query.audit ? <span className="ml-2 text-stone-500">audit: {query.audit}</span> : null}
        </div>
      ) : null}

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
          <Card title="평가 결과" subtitle="아직 제출된 평가가 없습니다.">
            <p className="text-sm text-stone-600">오른쪽 루브릭 항목 기준으로 평가를 제출할 수 있습니다.</p>
          </Card>
        )}
      </div>

      {rubric ? (
        <div className="mt-6">
          <Card title="평가 제출" subtitle="항목별 점수와 종합 코멘트를 mock action으로 기록">
            <form action={submitArtifactEvaluationAction} className="grid gap-4 text-sm">
              <input type="hidden" name="artifactId" value={artifact.id} />
              <input type="hidden" name="rubricId" value={rubric.id} />
              <input type="hidden" name="role" value={query.role ?? defaultEvaluatorRole} />
              <div className="grid gap-3 md:grid-cols-2">
                {rubricItems.map((item) => (
                  <div key={item.id} className="rounded-lg border border-stone-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-stone-950">{item.title}</p>
                        <p className="mt-1 text-xs text-stone-500">{item.description}</p>
                      </div>
                      <span className="text-xs font-medium text-stone-500">{item.maxScore}점</span>
                    </div>
                    <label className="mt-3 grid gap-1">
                      <span className="text-xs font-medium text-stone-500">점수</span>
                      <input
                        name={`score:${item.id}`}
                        type="number"
                        min="0"
                        max={item.maxScore}
                        defaultValue={item.maxScore}
                        className="h-10 rounded-md border border-stone-200 bg-white px-3 text-stone-700"
                      />
                    </label>
                    <label className="mt-3 grid gap-1">
                      <span className="text-xs font-medium text-stone-500">항목 코멘트</span>
                      <textarea
                        name={`comment:${item.id}`}
                        rows={3}
                        placeholder="판단 근거를 간단히 남겨주세요."
                        className="rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-700"
                      />
                    </label>
                  </div>
                ))}
              </div>
              <label className="grid gap-1">
                <span className="text-xs font-medium text-stone-500">종합 코멘트</span>
                <textarea
                  name="overallComment"
                  required
                  rows={4}
                  placeholder="총평과 다음 보완 방향을 남겨주세요."
                  className="rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-700"
                />
              </label>
              <button
                type="submit"
                className="h-10 rounded-md border border-teal-700 bg-teal-700 px-3 text-sm font-medium text-white"
              >
                평가 제출
              </button>
            </form>
          </Card>
        </div>
      ) : null}

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
