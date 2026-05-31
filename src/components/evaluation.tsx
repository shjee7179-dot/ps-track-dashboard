import Link from "next/link";
import { Card, StatusBadge } from "@/components/ui";
import {
  getEvaluationItemScores,
  getLearningOutcomeById,
  getRubricById,
  getRubricItems,
  getUserById,
  type Evaluation,
  type Rubric,
} from "@/lib/domain";

export function EvaluationSummaryCard({ evaluation }: { evaluation: Evaluation }) {
  const rubric = getRubricById(evaluation.rubricId);
  const scoreRate = Math.round((evaluation.totalScore / evaluation.maxScore) * 100);

  return (
    <Card title="평가 결과" subtitle={rubric?.title ?? evaluation.rubricId}>
      <div className="grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-stone-500">평가자</p>
          <p className="mt-1 font-medium text-stone-950">
            {getUserById(evaluation.evaluatorId)?.name ?? evaluation.evaluatorId}
          </p>
        </div>
        <div>
          <p className="text-stone-500">점수</p>
          <p className="mt-1 font-medium text-stone-950">
            {evaluation.totalScore}/{evaluation.maxScore} ({scoreRate}%)
          </p>
        </div>
        <div>
          <p className="text-stone-500">상태</p>
          <p className="mt-1">
            <StatusBadge>{evaluation.status === "submitted" ? "제출됨" : "작성 중"}</StatusBadge>
          </p>
        </div>
      </div>
      <p className="mt-4 rounded-lg bg-stone-50 p-3 text-sm text-stone-700">
        {evaluation.overallComment}
      </p>
    </Card>
  );
}

export function RubricPreview({ rubric }: { rubric: Rubric }) {
  const items = getRubricItems(rubric.id);

  return (
    <Card title="적용 루브릭" subtitle={`${rubric.title} / 최대 ${rubric.maxScore}점`}>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-stone-200 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-medium text-stone-950">{item.title}</p>
                <p className="mt-1 text-sm text-stone-600">{item.description}</p>
              </div>
              <StatusBadge>{item.maxScore}점</StatusBadge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.outcomeIds.map((outcomeId) => {
                const outcome = getLearningOutcomeById(outcomeId);
                return (
                  <Link key={outcomeId} href={`/outcomes/${outcomeId}`}>
                    <StatusBadge>{outcome?.code ?? outcomeId}</StatusBadge>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function EvaluationItemScores({ evaluation }: { evaluation: Evaluation }) {
  const rubricItems = getRubricItems(evaluation.rubricId);
  const scores = getEvaluationItemScores(evaluation.id);

  return (
    <Card title="항목별 점수">
      <div className="space-y-3">
        {rubricItems.map((item) => {
          const score = scores.find((candidate) => candidate.rubricItemId === item.id);
          return (
            <div key={item.id} className="rounded-lg border border-stone-200 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-stone-950">{item.title}</p>
                  <p className="mt-1 text-sm text-stone-600">{score?.comment ?? "평가 대기"}</p>
                </div>
                <StatusBadge>
                  {score ? `${score.score}/${item.maxScore}` : `0/${item.maxScore}`}
                </StatusBadge>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
