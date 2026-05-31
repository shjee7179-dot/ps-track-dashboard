import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { getUserById, teams } from "@/lib/domain";

export default function TeamsPage() {
  return (
    <AppShell title="팀 관리" eyebrow="Cohort / Teams">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="팀" value={`${teams.length}개`} tone="teal" />
        <Stat label="활성 팀" value={`${teams.filter((team) => team.status === "active").length}개`} />
        <Stat label="미배정" value="0개" />
      </div>
      <Card title="팀 목록">
        <div className="space-y-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/cohorts/2026/teams/${team.id}`}
              className="block rounded-lg border border-stone-200 p-4 hover:border-teal-700"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-stone-950">{team.name}</p>
                  <p className="mt-1 text-sm text-stone-600">{team.topic}</p>
                </div>
                <StatusBadge>{team.status}</StatusBadge>
              </div>
              <p className="mt-3 text-xs text-stone-500">
                멘토 {getUserById(team.mentorId)?.name} / 구성원 {team.memberIds.length}명
              </p>
            </Link>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
