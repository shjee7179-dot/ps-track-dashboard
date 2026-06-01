import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ArtifactCard } from "@/components/artifacts";
import { MentoringSessionCard } from "@/components/mentoring";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { mockRepositories } from "@/lib/mock-repositories";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const [team, users, learningPieces] = await Promise.all([
    mockRepositories.cohorts.getTeamById(teamId),
    mockRepositories.users.listUsers(),
    mockRepositories.learning.listLearningPieces(),
  ]);
  if (!team) notFound();

  const [teamArtifacts, teamMentoring] = await Promise.all([
    mockRepositories.artifacts.listArtifacts({ teamId: team.id }),
    mockRepositories.operations.listMentoringSessions({ teamId: team.id }),
  ]);
  const userById = new Map(users.map((user) => [user.id, user]));
  const learningPieceById = new Map(learningPieces.map((piece) => [piece.id, piece]));
  const artifactById = new Map(teamArtifacts.map((artifact) => [artifact.id, artifact]));

  return (
    <AppShell title={team.name} eyebrow="Team Detail">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="구성원" value={`${team.memberIds.length}명`} tone="teal" />
        <Stat label="멘토" value={userById.get(team.mentorId)?.name ?? "-"} />
        <Stat label="산출물" value={`${teamArtifacts.length}개`} />
        <Stat label="멘토링" value={`${teamMentoring.length}건`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card title="팀 정보">
          <p className="text-sm leading-6 text-stone-700">{team.topic}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {team.memberIds.map((memberId) => (
              <StatusBadge key={memberId}>{userById.get(memberId)?.name ?? memberId}</StatusBadge>
            ))}
          </div>
        </Card>
        <section className="space-y-4">
          {teamArtifacts.map((artifact) => (
            <ArtifactCard
              key={artifact.id}
              artifact={artifact}
              ownerName={team.name}
              learningPieceTitle={
                artifact.learningPieceId
                  ? learningPieceById.get(artifact.learningPieceId)?.title
                  : undefined
              }
            />
          ))}
          {teamMentoring.map((session) => (
            <MentoringSessionCard
              key={session.id}
              session={session}
              targetName={team.name}
              mentorName={userById.get(session.mentorId)?.name}
              artifactTitle={
                session.linkedArtifactId
                  ? artifactById.get(session.linkedArtifactId)?.title
                  : undefined
              }
            />
          ))}
        </section>
      </div>
      <Link
        href="/cohorts/2026/teams"
        className="mt-6 inline-flex rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700"
      >
        팀 목록으로
      </Link>
    </AppShell>
  );
}
