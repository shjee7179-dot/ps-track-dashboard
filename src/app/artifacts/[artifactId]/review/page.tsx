import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { createArtifactFeedbackAction } from "@/app/artifacts/[artifactId]/review/actions";
import { getArtifactStatusLabel } from "@/lib/domain";
import { mockRepositories } from "@/lib/mock-repositories";
import { repositories } from "@/lib/repositories";
import type { Artifact, Team, User } from "@/lib/types";

function getArtifactOwnerName(artifact: Artifact, users: User[], teams: Team[]) {
  if (artifact.ownerType === "student") {
    return users.find((user) => user.id === artifact.ownerId)?.name ?? artifact.ownerId;
  }
  return teams.find((team) => team.id === artifact.ownerId)?.name ?? artifact.ownerId;
}

export default async function ArtifactReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ artifactId: string }>;
  searchParams: Promise<{ role?: string; update?: string; audit?: string }>;
}) {
  const { artifactId } = await params;
  const query = await searchParams;
  const [artifact, feedback, users, teams] = await Promise.all([
    repositories.artifacts.getArtifactById(artifactId),
    repositories.artifacts.listFeedback(artifactId),
    mockRepositories.users.listUsers(),
    mockRepositories.cohorts.listTeams(),
  ]);
  if (!artifact) notFound();
  const userById = new Map(users.map((user) => [user.id, user]));
  const ownerName = getArtifactOwnerName(artifact, users, teams);
  const updateMessages: Record<string, string> = {
    created: "피드백 생성 요청이 접수되었습니다.",
    denied: "현재 역할/scope에서는 이 산출물에 피드백을 남길 수 없습니다.",
    invalid: "피드백 본문을 입력해 주세요.",
    missing: "산출물 레코드를 찾을 수 없습니다.",
  };
  const updateMessage = query.update ? updateMessages[query.update] : undefined;
  const defaultReviewerRole = artifact.ownerType === "team" ? "mentor" : "operator";

  return (
    <AppShell title={`${artifact.title} 리뷰`} eyebrow="Artifact Review">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="소유자" value={ownerName} tone="teal" />
        <Stat label="상태" value={getArtifactStatusLabel(artifact.status)} />
        <Stat label="피드백" value={`${feedback.length}건`} tone="amber" />
      </div>

      {updateMessage ? (
        <div className="mb-4 rounded-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
          {updateMessage}
          {query.audit ? <span className="ml-2 text-stone-500">audit: {query.audit}</span> : null}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="리뷰 큐" subtitle="피드백 흐름과 후속 액션을 기록">
          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item.id} className="rounded-lg border border-stone-200 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-sm text-stone-700">{item.body}</p>
                  <StatusBadge>{item.status === "open" ? "열림" : "해결"}</StatusBadge>
                </div>
                <p className="mt-2 text-xs text-stone-500">
                  {userById.get(item.authorId)?.name} / {item.createdAt}
                </p>
              </div>
            ))}
            {feedback.length === 0 ? (
              <p className="text-sm text-stone-500">아직 등록된 피드백이 없습니다.</p>
            ) : null}
          </div>
        </Card>
        <Card title="피드백 작성" subtitle="멘토/PI가 산출물 맥락에 남기는 조치 가능한 코멘트">
          <form action={createArtifactFeedbackAction} className="grid gap-3 text-sm">
            <input type="hidden" name="artifactId" value={artifact.id} />
            <input type="hidden" name="role" value={query.role ?? defaultReviewerRole} />
            <label className="grid gap-1">
              <span className="text-xs font-medium text-stone-500">피드백 본문</span>
              <textarea
                name="body"
                required
                rows={6}
                placeholder="수정 요청, 강점, 다음 액션을 구체적으로 남겨주세요."
                className="rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-700"
              />
            </label>
            <button
              type="submit"
              className="h-10 rounded-md border border-teal-700 bg-teal-700 px-3 text-sm font-medium text-white"
            >
              피드백 등록
            </button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
