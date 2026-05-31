import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import {
  artifacts,
  getArtifactReportRows,
  getParticipationReportRows,
  getProgramEvaluationSummary,
  reportExports,
  studentLearningPieceStatuses,
} from "@/lib/domain";

export default function ReportsPage() {
  const participationRows = getParticipationReportRows();
  const artifactRows = getArtifactReportRows();
  const evaluationSummary = getProgramEvaluationSummary();
  const completed = studentLearningPieceStatuses.filter((status) => status.status === "completed").length;

  return (
    <AppShell title="운영 리포트" eyebrow="Reports">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat
          label="완료율"
          value={`${Math.round((completed / studentLearningPieceStatuses.length) * 100)}%`}
          tone="teal"
        />
        <Stat label="산출물" value={`${artifacts.length}개`} />
        <Stat label="평가 평균" value={`${evaluationSummary.averageRate}%`} tone="amber" />
        <Stat label="CSV 내보내기" value={`${reportExports.length}종`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card title="참여율 / 완료율 리포트">
          <div className="space-y-3">
            {participationRows.map((row) => (
              <div key={`${row.student}-${row.learningPiece}`} className="rounded-lg border border-stone-200 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-stone-950">{row.learningPiece}</p>
                    <p className="mt-1 text-sm text-stone-600">{row.student}</p>
                  </div>
                  <StatusBadge>{row.status}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="산출물 현황 리포트">
          <div className="space-y-3">
            {artifactRows.map((row) => (
              <div key={row.artifact} className="rounded-lg border border-stone-200 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-stone-950">{row.artifact}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {row.owner} / {row.dueAt}
                    </p>
                  </div>
                  <StatusBadge>{row.status}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Link
          href="/reports/exports"
          className="rounded-md border border-teal-700 bg-teal-700 px-3 py-2 text-sm font-medium text-white"
        >
          CSV 내보내기
        </Link>
      </div>
    </AppShell>
  );
}
