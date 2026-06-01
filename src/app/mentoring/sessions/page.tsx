import { AppShell } from "@/components/app-shell";
import { MentoringSessionCard } from "@/components/mentoring";
import { Stat } from "@/components/ui";
import { mockRepositories } from "@/lib/mock-repositories";

export default async function MentoringSessionsPage() {
  const mentoringSessions = await mockRepositories.operations.listMentoringSessions();

  return (
    <AppShell title="멘토링 일정" eyebrow="Mentoring / Sessions">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="전체" value={`${mentoringSessions.length}건`} tone="teal" />
        <Stat
          label="예정"
          value={`${mentoringSessions.filter((session) => session.status === "scheduled").length}건`}
        />
        <Stat
          label="완료"
          value={`${mentoringSessions.filter((session) => session.status === "completed").length}건`}
        />
        <Stat
          label="이슈"
          value={`${mentoringSessions.filter((session) => session.status === "absent").length}건`}
          tone="amber"
        />
      </div>
      <div className="space-y-4">
        {mentoringSessions.map((session) => (
          <MentoringSessionCard key={session.id} session={session} />
        ))}
      </div>
    </AppShell>
  );
}
