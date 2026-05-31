import { AppShell } from "@/components/app-shell";
import { RolesTable, RouteAccessTable } from "@/components/tables";
import { Card, Stat } from "@/components/ui";
import { canAccessRoute, roleAssignments, routeAccessPolicies } from "@/lib/domain";

export default function RolesPage() {
  return (
    <AppShell title="역할 / 접근 범위 관리" eyebrow="Admin / Role + Scope">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="역할 배정" value={`${roleAssignments.length}건`} tone="teal" />
        <Stat label="권한 모델" value="Role + Scope" />
        <Stat label="삭제 권한" value="Admin only" tone="amber" />
      </div>
      <Card title="Role Assignment" subtitle="역할과 접근 범위를 함께 관리">
        <RolesTable assignments={roleAssignments} />
      </Card>
      <div className="mt-6">
        <Card title="Route Access Matrix" subtitle="화면별 role + scope 접근 정책 미리보기">
          <RouteAccessTable policies={routeAccessPolicies} canAccess={canAccessRoute} />
        </Card>
      </div>
    </AppShell>
  );
}
