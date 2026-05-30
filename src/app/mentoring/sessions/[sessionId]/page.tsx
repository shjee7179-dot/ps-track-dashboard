import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import {
  getArtifactById,
  getMentoringSessionById,
  getMentoringStatusLabel,
  getMentoringTargetName,
  getUserById,
} from "@/lib/domain";

export default async function MentoringSessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = getMentoringSessionById(sessionId);
  if (!session) notFound();

  const mentor = getUserById(session.mentorId);
  const artifact = session.linkedArtifactId ? getArtifactById(session.linkedArtifactId) : undefined;

  return (
    <AppShell title={`${getMentoringTargetName(session)} 멘토링`} eyebrow="Mentoring Record">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="대상" value={getMentoringTargetName(session)} tone="teal" />
        <Stat label="멘토" value={mentor?.name ?? session.mentorId} />
        <Stat label="상태" value={getMentoringStatusLabel(session.status)} />
        <Stat label="일정" value={session.scheduledAt} tone="amber" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="멘토링 기록">
          <p className="text-sm leading-6 text-stone-700">{session.notes}</p>
          {session.externalMeetingUrl ? (
            <a
              href={session.externalMeetingUrl}
              className="mt-4 inline-flex rounded-md border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 hover:border-teal-700 hover:text-teal-800"
            >
              외부 회의 링크
            </a>
          ) : null}
        </Card>
        <Card title="연결 산출물">
          {artifact ? (
            <Link href={`/artifacts/${artifact.id}`} className="font-medium text-teal-800">
              {artifact.title}
            </Link>
          ) : (
            <p className="text-sm text-stone-500">연결된 산출물이 없습니다.</p>
          )}
        </Card>
      </div>
      <div className="mt-6">
        <Card title="후속 액션">
          <div className="space-y-2">
            {session.nextActions.map((action) => (
              <div key={action} className="flex items-center gap-2 text-sm text-stone-700">
                <StatusBadge>Action</StatusBadge>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
