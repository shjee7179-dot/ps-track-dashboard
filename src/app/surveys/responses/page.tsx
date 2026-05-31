import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import {
  getStudentById,
  getSurveyResponseSummary,
  surveyResponses,
  surveys,
} from "@/lib/domain";

const responseLabels = {
  not_sent: "미발송",
  sent: "발송됨",
  responded: "응답 완료",
};

export default function SurveyResponsesPage() {
  const totalResponses = surveyResponses.length;
  const responded = surveyResponses.filter((response) => response.responseStatus === "responded").length;

  return (
    <AppShell title="설문 응답 여부" eyebrow="Survey Responses">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="응답 대상" value={`${totalResponses}건`} tone="teal" />
        <Stat label="응답 완료" value={`${responded}건`} />
        <Stat
          label="전체 응답률"
          value={`${totalResponses ? Math.round((responded / totalResponses) * 100) : 0}%`}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card title="설문별 요약">
          <div className="space-y-3">
            {surveys.map((survey) => {
              const summary = getSurveyResponseSummary(survey.id);
              return (
                <div key={survey.id} className="rounded-lg border border-stone-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-stone-950">{survey.title}</p>
                      <p className="mt-1 text-sm text-stone-600">
                        응답 {summary.responded} / 대상 {summary.total}
                      </p>
                    </div>
                    <StatusBadge>{summary.responseRate}%</StatusBadge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="학생별 응답 로그">
          <div className="space-y-3">
            {surveyResponses.map((response) => {
              const survey = surveys.find((item) => item.id === response.surveyId);
              return (
                <div key={response.id} className="rounded-lg border border-stone-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-stone-950">
                        {getStudentById(response.respondentId)?.name ?? response.respondentId}
                      </p>
                      <p className="mt-1 text-sm text-stone-600">{survey?.title}</p>
                      {response.respondedAt ? (
                        <p className="mt-1 text-xs text-stone-500">{response.respondedAt}</p>
                      ) : null}
                    </div>
                    <StatusBadge>{responseLabels[response.responseStatus]}</StatusBadge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Link
          href="/surveys"
          className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700"
        >
          설문 목록
        </Link>
      </div>
    </AppShell>
  );
}
