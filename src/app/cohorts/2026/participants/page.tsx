import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { mockRepositories } from "@/lib/mock-repositories";

export default async function ParticipantsPage() {
  const users = await mockRepositories.users.listUsers();
  const participants = users.filter((user) => user.defaultRole === "student");
  const summaries = await Promise.all(
    participants.map(async (participant) => [
      participant.id,
      await mockRepositories.learning.getJourneySummary(participant.id),
    ] as const),
  );
  const summaryByParticipantId = new Map(summaries);

  return (
    <AppShell title="참여자 관리" eyebrow="Cohort / Participants">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="학생참여자" value={`${participants.length}명`} tone="teal" />
        <Stat
          label="운영자"
          value={`${users.filter((user) => user.defaultRole === "operator").length}명`}
        />
        <Stat
          label="멘토"
          value={`${users.filter((user) => user.defaultRole === "mentor").length}명`}
        />
      </div>
      <Card title="참여자 목록" subtitle="학생 개인 기준 여정으로 바로 이동">
        <div className="space-y-3">
          {participants.map((participant) => {
            const summary = summaryByParticipantId.get(participant.id);
            return (
              <Link
                key={participant.id}
                href={`/journeys/students/${participant.id}`}
                className="grid gap-2 rounded-lg border border-stone-200 p-4 hover:border-teal-700 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-medium text-stone-950">{participant.name}</p>
                  <p className="mt-1 text-sm text-stone-500">{participant.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge>
                    완료 {summary?.completed ?? 0}/{summary?.total ?? 0}
                  </StatusBadge>
                  <StatusBadge>조치 {summary?.needsAction ?? 0}</StatusBadge>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </AppShell>
  );
}
