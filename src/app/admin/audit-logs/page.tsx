import { AppShell } from "@/components/app-shell";
import { LogsTable } from "@/components/tables";
import { Card, Stat } from "@/components/ui";
import { auditLogs } from "@/lib/domain";

export default function AuditLogsPage() {
  return (
    <AppShell title="감사 로그" eyebrow="Admin / Audit Logs">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="감사 이벤트" value={`${auditLogs.length}건`} tone="teal" />
        <Stat label="조회 권한" value="Admin" />
        <Stat label="보존 정책" value="정책 확정 전" tone="amber" />
      </div>
      <Card title="중요 변경 이벤트" subtitle="설정, 권한, 중요 운영 데이터 변경 기록">
        <LogsTable logs={auditLogs} />
      </Card>
    </AppShell>
  );
}
