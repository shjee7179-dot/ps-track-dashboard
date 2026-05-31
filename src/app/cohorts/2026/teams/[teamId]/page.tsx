import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ArtifactCard } from "@/components/artifacts";
import { MentoringSessionCard } from "@/components/mentoring";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { artifacts, getTeamById, getUserById, mentoringSessions } from "@/lib/domain";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const team = getTeamById(teamId);
  if (!team) notFound();

  const teamArtifacts = artifacts.filter(
    (artifact) => artifact.ownerType === "team" && artifact.ownerId === team.id,
  );
  const teamMentoring = mentoringSessions.filter(
    (session) => session.targetType === "team" && session.targetId === team.id,
  );

  return (
    <AppShell title={team.name} eyebrow="Team Detail">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="구성원" value={`${team.memberIds.length}명`} tone="teal" />
        <Stat label="멘토" value={getUserById(team.mentorId)?.name ?? "-"} />
        <Stat label="산출물" value={`${teamArtifacts.length}개`} />
        <Stat label="멘토링" value={`${teamMentoring.length}건`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card title="팀 정보">
          <p className="text-sm leading-6 text-stone-700">{team.topic}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {team.memberIds.map((memberId) => (
              <StatusBadge key={memberId}>{getUserById(memberId)?.name ?? memberId}</StatusBadge>
            ))}
          </div>
        </Card>
        <section className="space-y-4">
          {teamArtifacts.map((artifact) => (
            <ArtifactCard key={artifact.id} artifact={artifact} />
          ))}
          {teamMentoring.map((session) => (
            <MentoringSessionCard key={session.id} session={session} />
          ))}
        </section>
      </div>
      <Link href="/cohorts/2026/teams" className="mt-6 inline-flex rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700">
        팀 목록으로
      </Link>
    </AppShell>
  );
}
