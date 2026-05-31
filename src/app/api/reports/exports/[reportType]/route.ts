import { getCsvPreview, reportExports, type ReportExport } from "@/lib/domain";

const reportTypes = new Set<ReportExport["reportType"]>([
  "participation",
  "artifact_status",
  "outcome_summary",
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reportType: string }> },
) {
  const { reportType } = await params;

  if (!reportTypes.has(reportType as ReportExport["reportType"])) {
    return Response.json({ error: "Unknown report type" }, { status: 404 });
  }

  const typedReportType = reportType as ReportExport["reportType"];
  const exportMeta = reportExports.find((report) => report.reportType === typedReportType);
  const csv = getCsvPreview(typedReportType);
  const fileName = `${typedReportType}-${exportMeta?.generatedAt.slice(0, 10) ?? "export"}.csv`;

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
