import { getCsvPreview, reportExports, type ReportExport } from "@/lib/domain";
import { sessionProvider } from "@/lib/session-provider";

const reportTypes = new Set<ReportExport["reportType"]>([
  "participation",
  "artifact_status",
  "outcome_summary",
]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reportType: string }> },
) {
  const { reportType } = await params;
  const { searchParams } = new URL(request.url);

  if (!reportTypes.has(reportType as ReportExport["reportType"])) {
    return Response.json({ error: "Unknown report type" }, { status: 404 });
  }

  const session = await sessionProvider.requireSession({
    roleParam: searchParams.get("role"),
  });
  const decision = await sessionProvider.canAccess(session, {
    action: "read",
    scopeType: "cohort",
    scopeId: "550e8400-e29b-41d4-a716-446655440001",
  });

  if (!decision.allowed) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
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
