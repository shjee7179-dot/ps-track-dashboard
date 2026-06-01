import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { mockRepositories } from "@/lib/mock-repositories";

export default async function MentorAssignmentsPage() {
  const [teams, users] = await Promise.all([
    mockRepositories.cohorts.listTeams(),
    mockRepositories.users.listUsers(),
  ]);
  const mentors = users.filter((user) => user.defaultRole === "mentor");
  const userById = new Map(users.map((user) => [user.id, user]));

  return (
    <AppShell title="멘토 배정" eyebrow="Cohort / Mentor Assignments">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="멘토" value={`${mentors.length}명`} tone="teal" />
        <Stat label="배정 팀" value={`${teams.filter((team) => team.mentorId).length}개`} />
        <Stat
          label="미배정 팀"
          value={`${teams.filter((team) => !team.mentorId).length}개`}
          tone="amber"
        />
      </div>
      <Card title="배정 현황" subtitle="1차는 팀-멘토 배정 현황 확인 중심">
        <div className="space-y-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="grid gap-2 rounded-lg border border-stone-200 p-4 sm:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="font-medium text-stone-950">{team.name}</p>
                <p className="mt-1 text-sm text-stone-600">{team.topic}</p>
              </div>
              <StatusBadge>{userById.get(team.mentorId)?.name ?? "미배정"}</StatusBadge>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
