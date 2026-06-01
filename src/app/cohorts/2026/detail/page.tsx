import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Stat } from "@/components/ui";
import { mockRepositories } from "@/lib/mock-repositories";

export default async function CohortDetailPage() {
  const [cohort, modules, notices, teams, users] = await Promise.all([
    mockRepositories.cohorts.getActiveCohort(),
    mockRepositories.learning.listModules(),
    mockRepositories.admin.listNotices(),
    mockRepositories.cohorts.listTeams(),
    mockRepositories.users.listUsers(),
  ]);
  const students = users.filter((user) => user.defaultRole === "student");

  return (
    <AppShell title="기수 상세" eyebrow="Cohort / 2026">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="상태" value={cohort?.status ?? "-"} tone="teal" />
        <Stat label="참여자" value={`${students.length}명`} />
        <Stat label="팀" value={`${teams.length}개`} />
        <Stat label="공지" value={`${notices.length}건`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="일정">
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-stone-500">협약</dt>
              <dd className="font-medium text-stone-950">{cohort?.agreementDate ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">운영 시작</dt>
              <dd className="font-medium text-stone-950">{cohort?.startsAt ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">운영 종료</dt>
              <dd className="font-medium text-stone-950">{cohort?.endsAt ?? "-"}</dd>
            </div>
          </dl>
        </Card>
        <Card title="모듈 구성">
          <div className="space-y-3">
            {modules.map((moduleInfo) => (
              <div key={moduleInfo.id} className="border-b border-stone-100 pb-3 last:border-0">
                <p className="font-medium text-stone-950">{moduleInfo.title}</p>
                <p className="mt-1 text-sm text-stone-600">{moduleInfo.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/cohorts/2026/participants"
          className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700"
        >
          참여자
        </Link>
        <Link
          href="/cohorts/2026/teams"
          className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700"
        >
          팀
        </Link>
        <Link
          href="/cohorts/2026/mentor-assignments"
          className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700"
        >
          멘토 배정
        </Link>
      </div>
    </AppShell>
  );
}
