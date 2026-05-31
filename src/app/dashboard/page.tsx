import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { cohort2026, getDefaultAssignment, type Role } from "@/lib/domain";

const roleCopy: Record<Role, { title: string; focus: string; stats: string[] }> = {
  student: {
    title: "학생 대시보드",
    focus: "이번 주 해야 할 일과 마감 임박 항목을 우선 확인한다.",
    stats: ["이번 주 할 일 4개", "제출 필요 1개", "예정 멘토링 1건"],
  },
  operator: {
    title: "운영자 대시보드",
    focus: "학습피스 지연, 산출물 미제출, 멘토링 이슈를 조치한다.",
    stats: ["위험 신호 3건", "리마인드 후보 5명", "미배정 1팀"],
  },
  mentor: {
    title: "멘토 대시보드",
    focus: "담당 학생/팀의 산출물과 멘토링 기록을 관리한다.",
    stats: ["담당 팀 1개", "리뷰 대기 2건", "후속 액션 3개"],
  },
  pi: {
    title: "PI 대시보드",
    focus: "산출물 품질과 학습성과 요약을 확인한다.",
    stats: ["평가 완료 2건", "성과 지표 5개", "고위험 요약 3건"],
  },
  admin: {
    title: "총괄 관리자 대시보드",
    focus: "권한, 로그, 시스템 설정, PWA 상태를 점검한다.",
    stats: ["사용자 5명", "역할 배정 5건", "PWA 설치 가능"],
  },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: Role }>;
}) {
  const params = await searchParams;
  const role = params.role ?? "admin";
  const copy = roleCopy[role] ?? roleCopy.admin;
  const assignment = getDefaultAssignment(role);

  return (
    <AppShell title={copy.title} eyebrow={`${cohort2026.name} / ${role}`}>
      <div className="grid gap-4 sm:grid-cols-3">
        {copy.stats.map((stat, index) => (
          <Stat
            key={stat}
            label={["운영 단서", "조치 대상", "상태"][index] ?? "요약"}
            value={stat}
            tone={index === 0 ? "teal" : index === 1 ? "amber" : "neutral"}
          />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="현재 역할 기준" subtitle={copy.focus}>
          <div className="grid gap-3 text-sm text-stone-600 sm:grid-cols-2">
            <div>
              <p className="text-stone-500">Role</p>
              <p className="mt-1 font-medium text-stone-950">{assignment.role}</p>
            </div>
            <div>
              <p className="text-stone-500">Scope</p>
              <p className="mt-1 font-medium text-stone-950">
                {assignment.scopeType} / {assignment.scopeId}
              </p>
            </div>
            <div>
              <p className="text-stone-500">Cohort</p>
              <p className="mt-1 font-medium text-stone-950">{cohort2026.name}</p>
            </div>
            <div>
              <p className="text-stone-500">Status</p>
              <p className="mt-1">
                <StatusBadge>{cohort2026.status}</StatusBadge>
              </p>
            </div>
          </div>
        </Card>
        <Card title="Sprint 0 관리 화면">
          <div className="grid gap-2">
            {[
              ["/pi/dashboard", "PI 성과·품질 대시보드"],
              ["/outcomes", "학습성과"],
              ["/admin/users", "사용자 관리"],
              ["/admin/roles", "역할 / 접근 범위"],
              ["/admin/audit-logs", "감사 로그"],
              ["/admin/access-logs", "접속 로그"],
              ["/admin/pwa", "PWA 설정"],
              ["/admin/settings", "전체 시스템 설정"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-700 transition hover:border-teal-700 hover:text-teal-800"
              >
                {label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
