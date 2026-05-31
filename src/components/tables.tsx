import { StatusBadge } from "@/components/ui";
import type { LogEvent, Role, RoleAssignment, RouteAccessPolicy, User } from "@/lib/domain";

export function UsersTable({ users }: { users: User[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-stone-500">
            <th className="py-3 pr-4 font-medium">이름</th>
            <th className="py-3 pr-4 font-medium">이메일</th>
            <th className="py-3 pr-4 font-medium">소속</th>
            <th className="py-3 pr-4 font-medium">기본 역할</th>
            <th className="py-3 font-medium">상태</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-stone-100">
              <td className="py-3 pr-4 font-medium text-stone-950">{user.name}</td>
              <td className="py-3 pr-4 text-stone-600">{user.email}</td>
              <td className="py-3 pr-4 text-stone-600">{user.affiliation}</td>
              <td className="py-3 pr-4 text-stone-600">{user.defaultRole}</td>
              <td className="py-3">
                <StatusBadge>{user.status}</StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RolesTable({ assignments }: { assignments: RoleAssignment[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-stone-500">
            <th className="py-3 pr-4 font-medium">사용자 ID</th>
            <th className="py-3 pr-4 font-medium">역할</th>
            <th className="py-3 pr-4 font-medium">Scope</th>
            <th className="py-3 pr-4 font-medium">Scope ID</th>
            <th className="py-3 font-medium">상태</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.id} className="border-b border-stone-100">
              <td className="py-3 pr-4 font-medium text-stone-950">{assignment.userId}</td>
              <td className="py-3 pr-4 text-stone-600">{assignment.role}</td>
              <td className="py-3 pr-4 text-stone-600">{assignment.scopeType}</td>
              <td className="py-3 pr-4 text-stone-600">{assignment.scopeId}</td>
              <td className="py-3">
                <StatusBadge>{assignment.status}</StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LogsTable({ logs }: { logs: LogEvent[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-stone-500">
            <th className="py-3 pr-4 font-medium">시각</th>
            <th className="py-3 pr-4 font-medium">주체</th>
            <th className="py-3 pr-4 font-medium">이벤트</th>
            <th className="py-3 pr-4 font-medium">대상</th>
            <th className="py-3 font-medium">등급</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-stone-100">
              <td className="py-3 pr-4 text-stone-600">{log.occurredAt}</td>
              <td className="py-3 pr-4 font-medium text-stone-950">{log.actor}</td>
              <td className="py-3 pr-4 text-stone-600">{log.event}</td>
              <td className="py-3 pr-4 text-stone-600">{log.target}</td>
              <td className="py-3">
                <StatusBadge>{log.severity}</StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RouteAccessTable({
  policies,
  canAccess,
}: {
  policies: RouteAccessPolicy[];
  canAccess: (role: Role, href: string) => boolean;
}) {
  const roles: Role[] = ["student", "operator", "mentor", "pi", "admin"];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[840px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-stone-500">
            <th className="py-3 pr-4 font-medium">화면</th>
            <th className="py-3 pr-4 font-medium">그룹</th>
            <th className="py-3 pr-4 font-medium">대상 Scope</th>
            {roles.map((role) => (
              <th key={role} className="py-3 pr-4 font-medium">
                {role}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {policies.map((policy) => (
            <tr key={policy.href} className="border-b border-stone-100">
              <td className="py-3 pr-4 font-medium text-stone-950">{policy.label}</td>
              <td className="py-3 pr-4 text-stone-600">{policy.navGroup}</td>
              <td className="py-3 pr-4 text-stone-600">
                {policy.targetScopeType} / {policy.targetScopeId}
              </td>
              {roles.map((role) => (
                <td key={role} className="py-3 pr-4">
                  <StatusBadge>{canAccess(role, policy.href) ? "허용" : "차단"}</StatusBadge>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
