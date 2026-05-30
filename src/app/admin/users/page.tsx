import { AppShell } from "@/components/app-shell";
import { UsersTable } from "@/components/tables";
import { Card, Stat } from "@/components/ui";
import { users } from "@/lib/domain";

export default function UsersPage() {
  return (
    <AppShell title="사용자 관리" eyebrow="Admin / Users">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="등록 사용자" value={`${users.length}명`} tone="teal" />
        <Stat label="활성 사용자" value={`${users.filter((user) => user.status === "active").length}명`} />
        <Stat label="역할 유형" value="5개" />
      </div>
      <Card title="사용자 목록" subtitle="Sprint 0 seed 사용자">
        <UsersTable users={users} />
      </Card>
    </AppShell>
  );
}
