import { AppShell } from "@/components/app-shell";
import { LogsTable } from "@/components/tables";
import { Card, Stat } from "@/components/ui";
import { accessLogs } from "@/lib/domain";

export default function AccessLogsPage() {
  return (
    <AppShell title="접속 로그" eyebrow="Admin / Access Logs">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="접속 이벤트" value={`${accessLogs.length}건`} tone="teal" />
        <Stat label="기록 범위" value="로그인 / 역할 선택" />
        <Stat label="상세 추적" value="2차 확장" />
      </div>
      <Card title="접속 이벤트" subtitle="로그인, 로그아웃, 세션 갱신, 역할 선택 기록">
        <LogsTable logs={accessLogs} />
      </Card>
    </AppShell>
  );
}
