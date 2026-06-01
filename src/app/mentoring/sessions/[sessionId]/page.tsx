import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { updateMentoringRecordAction } from "@/app/mentoring/sessions/[sessionId]/actions";
import { getMentoringStatusLabel } from "@/lib/domain";
import { mockRepositories } from "@/lib/mock-repositories";
import type { MentoringSession, Team, User } from "@/lib/types";

function getMentoringTargetName(session: MentoringSession, users: User[], teams: Team[]) {
  if (session.targetType === "student") {
    return users.find((user) => user.id === session.targetId)?.name ?? session.targetId;
  }
  return teams.find((team) => team.id === session.targetId)?.name ?? session.targetId;
}

export default async function MentoringSessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ role?: string; update?: string; audit?: string }>;
}) {
  const { sessionId } = await params;
  const query = await searchParams;
  const [session, users, teams] = await Promise.all([
    mockRepositories.operations.getMentoringSessionById(sessionId),
    mockRepositories.users.listUsers(),
    mockRepositories.cohorts.listTeams(),
  ]);
  if (!session) notFound();

  const mentor = users.find((user) => user.id === session.mentorId);
  const artifact = session.linkedArtifactId
    ? await mockRepositories.artifacts.getArtifactById(session.linkedArtifactId)
    : undefined;
  const targetName = getMentoringTargetName(session, users, teams);
  const updateMessages: Record<string, string> = {
    saved: "멘토링 기록 저장 요청이 mock repository를 통해 접수되었습니다.",
    denied: "현재 역할/scope에서는 이 멘토링 기록을 수정할 수 없습니다.",
    invalid: "상태와 기록 본문을 확인해 주세요.",
    missing: "멘토링 세션 레코드를 찾을 수 없습니다.",
  };
  const updateMessage = query.update ? updateMessages[query.update] : undefined;
  const defaultEditorRole = session.targetType === "team" ? "mentor" : "operator";
  const nextActionsText = session.nextActions.join("\n");

  return (
    <AppShell title={`${targetName} 멘토링`} eyebrow="Mentoring Record">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="대상" value={targetName} tone="teal" />
        <Stat label="멘토" value={mentor?.name ?? session.mentorId} />
        <Stat label="상태" value={getMentoringStatusLabel(session.status)} />
        <Stat label="일정" value={session.scheduledAt} tone="amber" />
      </div>

      {updateMessage ? (
        <div className="mb-4 rounded-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
          {updateMessage}
          {query.audit ? <span className="ml-2 text-stone-500">audit: {query.audit}</span> : null}
        </div>
      ) : null}

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
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
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
        <Card title="기록 수정" subtitle="상태, 기록, 후속 액션을 mock action으로 저장">
          <form action={updateMentoringRecordAction} className="grid gap-3 text-sm">
            <input type="hidden" name="sessionId" value={session.id} />
            <input type="hidden" name="role" value={query.role ?? defaultEditorRole} />
            <label className="grid gap-1">
              <span className="text-xs font-medium text-stone-500">상태</span>
              <select
                name="status"
                defaultValue={session.status}
                className="h-10 rounded-md border border-stone-200 bg-white px-3 text-stone-700"
              >
                <option value="scheduled">예정</option>
                <option value="completed">완료</option>
                <option value="absent">불참</option>
                <option value="cancelled">취소</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-medium text-stone-500">멘토링 기록</span>
              <textarea
                name="notes"
                required
                rows={5}
                defaultValue={session.notes}
                className="rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-700"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-medium text-stone-500">후속 액션</span>
              <textarea
                name="nextActions"
                rows={5}
                defaultValue={nextActionsText}
                className="rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-700"
              />
            </label>
            <button
              type="submit"
              className="h-10 rounded-md border border-teal-700 bg-teal-700 px-3 text-sm font-medium text-white"
            >
              기록 저장
            </button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
