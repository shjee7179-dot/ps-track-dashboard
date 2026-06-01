import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { createArtifactSubmissionAction } from "@/app/artifacts/[artifactId]/actions";
import { getArtifactStatusLabel } from "@/lib/domain";
import { mockRepositories } from "@/lib/mock-repositories";
import type { Artifact, Team, User } from "@/lib/types";

function getArtifactOwnerName(artifact: Artifact, users: User[], teams: Team[]) {
  if (artifact.ownerType === "student") {
    return users.find((user) => user.id === artifact.ownerId)?.name ?? artifact.ownerId;
  }
  return teams.find((team) => team.id === artifact.ownerId)?.name ?? artifact.ownerId;
}

export default async function ArtifactDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ artifactId: string }>;
  searchParams: Promise<{ role?: string; update?: string; audit?: string }>;
}) {
  const { artifactId } = await params;
  const query = await searchParams;
  const [artifact, submissions, feedback, evaluations, users, teams] = await Promise.all([
    mockRepositories.artifacts.getArtifactById(artifactId),
    mockRepositories.artifacts.listSubmissions(artifactId),
    mockRepositories.artifacts.listFeedback(artifactId),
    mockRepositories.evaluations.listEvaluations(artifactId),
    mockRepositories.users.listUsers(),
    mockRepositories.cohorts.listTeams(),
  ]);
  if (!artifact) notFound();

  const learningPiece = artifact.learningPieceId
    ? await mockRepositories.learning.getLearningPieceById(artifact.learningPieceId)
    : undefined;
  const userById = new Map(users.map((user) => [user.id, user]));
  const ownerName = getArtifactOwnerName(artifact, users, teams);
  const updateMessages: Record<string, string> = {
    submitted: "산출물 제출 요청이 mock repository를 통해 접수되었습니다.",
    denied: "현재 역할/scope에서는 이 산출물을 제출할 수 없습니다.",
    invalid: "제출 메모와 파일명 또는 외부 링크를 확인해 주세요.",
    missing: "산출물 레코드를 찾을 수 없습니다.",
  };
  const updateMessage = query.update ? updateMessages[query.update] : undefined;

  return (
    <AppShell title={artifact.title} eyebrow="Artifact Detail">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="소유" value={ownerName} tone="teal" />
        <Stat label="상태" value={getArtifactStatusLabel(artifact.status)} />
        <Stat label="제출 버전" value={`${submissions.length}개`} />
        <Stat label="평가" value={`${evaluations.length}건`} tone="amber" />
      </div>

      {updateMessage ? (
        <div className="mb-4 rounded-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
          {updateMessage}
          {query.audit ? <span className="ml-2 text-stone-500">audit: {query.audit}</span> : null}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="제출 이력" subtitle="학생 또는 팀의 산출물 제출 버전">
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div key={submission.id} className="border-b border-stone-100 pb-3 last:border-0">
                <p className="font-medium text-stone-950">v{submission.version}</p>
                <p className="mt-1 text-sm text-stone-600">{submission.note}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {submission.submittedAt} / {userById.get(submission.submittedBy)?.name}
                </p>
              </div>
            ))}
            {submissions.length === 0 ? (
              <p className="text-sm text-stone-500">아직 제출 이력이 없습니다.</p>
            ) : null}
          </div>
        </Card>
        <div className="space-y-6">
          <Card title="제출 등록" subtitle="링크 또는 파일명을 기록하고 새 버전 제출로 접수">
            <form action={createArtifactSubmissionAction} className="grid gap-3 text-sm">
              <input type="hidden" name="artifactId" value={artifact.id} />
              <input type="hidden" name="role" value={query.role ?? "student"} />
              <label className="grid gap-1">
                <span className="text-xs font-medium text-stone-500">외부 링크</span>
                <input
                  name="externalUrl"
                  type="url"
                  placeholder="https://..."
                  className="h-10 rounded-md border border-stone-200 bg-white px-3 text-stone-700"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-medium text-stone-500">파일명</span>
                <input
                  name="fileName"
                  placeholder="research-plan-v2.pdf"
                  className="h-10 rounded-md border border-stone-200 bg-white px-3 text-stone-700"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-medium text-stone-500">제출 메모</span>
                <textarea
                  name="note"
                  required
                  rows={4}
                  placeholder="이번 제출 버전의 변경점이나 확인 요청을 남겨주세요."
                  className="rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-700"
                />
              </label>
              <button
                type="submit"
                className="h-10 rounded-md border border-teal-700 bg-teal-700 px-3 text-sm font-medium text-white"
              >
                제출 등록
              </button>
            </form>
          </Card>
          <Card title="연결 정보">
            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="text-stone-500">연결 학습피스</dt>
                <dd className="mt-1 font-medium text-stone-950">
                  {learningPiece?.title ?? "미지정"}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">성과 태그</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {artifact.outcomeTags.map((tag) => (
                    <StatusBadge key={tag}>{tag}</StatusBadge>
                  ))}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card title="피드백">
          <div className="space-y-3">
            {feedback.map((item) => (
              <div key={item.id} className="border-b border-stone-100 pb-3 last:border-0">
                <p className="text-sm text-stone-700">{item.body}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {userById.get(item.authorId)?.name} / {item.createdAt}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/artifacts/${artifact.id}/review`}
          className="rounded-md border border-teal-700 bg-teal-700 px-3 py-2 text-sm font-medium text-white"
        >
          산출물 리뷰
        </Link>
        <Link
          href={`/artifacts/${artifact.id}/evaluation`}
          className="rounded-md border border-stone-900 bg-stone-900 px-3 py-2 text-sm font-medium text-white"
        >
          루브릭 평가
        </Link>
        <Link
          href="/artifacts"
          className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700"
        >
          목록으로
        </Link>
      </div>
    </AppShell>
  );
}
