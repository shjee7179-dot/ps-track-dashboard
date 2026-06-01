import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import {
  getArtifactById,
  getMentoringStatusLabel,
  getMentoringTargetName,
  getUserById,
  type MentoringSession,
} from "@/lib/domain";

export function MentoringSessionCard({
  session,
  targetName,
  mentorName,
  artifactTitle,
}: {
  session: MentoringSession;
  targetName?: string;
  mentorName?: string;
  artifactTitle?: string;
}) {
  const artifact = session.linkedArtifactId ? getArtifactById(session.linkedArtifactId) : undefined;
  const mentor = getUserById(session.mentorId);

  return (
    <Link
      href={`/mentoring/sessions/${session.id}`}
      className="block rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition hover:border-teal-700"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium text-teal-800">
            {session.targetType === "student" ? "개인 멘토링" : "팀 멘토링"} /{" "}
            {targetName ?? getMentoringTargetName(session)}
          </p>
          <h2 className="mt-1 text-base font-semibold text-stone-950">{session.scheduledAt}</h2>
          <p className="mt-2 text-sm text-stone-600">{session.notes}</p>
        </div>
        <StatusBadge>{getMentoringStatusLabel(session.status)}</StatusBadge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-500">
        <span>멘토 {mentorName ?? mentor?.name ?? session.mentorId}</span>
        <span>연결 산출물 {artifactTitle ?? artifact?.title ?? "없음"}</span>
      </div>
    </Link>
  );
}
