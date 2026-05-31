import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { getCsvPreview, reportExports } from "@/lib/domain";

const reportTypeLabels = {
  participation: "참여율",
  artifact_status: "산출물",
  outcome_summary: "성과",
};

export default function ReportExportsPage() {
  return (
    <AppShell title="CSV 내보내기" eyebrow="Report Exports">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="내보내기 유형" value={`${reportExports.length}종`} tone="teal" />
        <Stat label="형식" value="CSV" />
        <Stat label="저장 방식" value="mock preview" tone="amber" />
      </div>

      <div className="space-y-6">
        {reportExports.map((report) => (
          <Card key={report.id} title={report.title} subtitle={`${report.generatedAt} 생성`}>
            <div className="mb-4 flex flex-wrap gap-2">
              <StatusBadge>{reportTypeLabels[report.reportType]}</StatusBadge>
              <StatusBadge>{report.format.toUpperCase()}</StatusBadge>
              <StatusBadge>{report.rowCount} rows</StatusBadge>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-stone-950 p-4 text-xs leading-6 text-stone-50">
              {getCsvPreview(report.reportType)}
            </pre>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href="/reports"
          className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700"
        >
          리포트로
        </Link>
      </div>
    </AppShell>
  );
}
