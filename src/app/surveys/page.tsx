import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { getLearningOutcomeById, getSurveyResponseSummary, surveys } from "@/lib/domain";

const surveyTypeLabels = {
  pre: "사전",
  post: "사후",
  pulse: "중간",
};

export default function SurveysPage() {
  return (
    <AppShell title="설문 링크 관리" eyebrow="External Surveys">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="외부 설문" value={`${surveys.length}개`} tone="teal" />
        <Stat label="자체 빌더" value="1차 제외" />
        <Stat label="응답 추적" value="활성" tone="amber" />
      </div>

      <Card title="설문 목록" subtitle="외부 설문 링크와 응답 여부만 관리">
        <div className="space-y-3">
          {surveys.map((survey) => {
            const summary = getSurveyResponseSummary(survey.id);
            return (
              <div key={survey.id} className="rounded-lg border border-stone-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-stone-950">{survey.title}</p>
                    <p className="mt-1 break-all text-sm text-stone-600">{survey.externalUrl}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {survey.linkedOutcomeIds.map((outcomeId) => (
                        <StatusBadge key={outcomeId}>
                          {getLearningOutcomeById(outcomeId)?.code ?? outcomeId}
                        </StatusBadge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <StatusBadge>{surveyTypeLabels[survey.surveyType]}</StatusBadge>
                    <StatusBadge>{survey.dueAt}</StatusBadge>
                    <StatusBadge>{summary.responseRate}%</StatusBadge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-6">
        <Link
          href="/surveys/responses"
          className="rounded-md border border-teal-700 bg-teal-700 px-3 py-2 text-sm font-medium text-white"
        >
          응답 현황
        </Link>
      </div>
    </AppShell>
  );
}
