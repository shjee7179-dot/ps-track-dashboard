import Link from "next/link";
import { Card, StatusBadge } from "@/components/ui";
import {
  getContentById,
  getModuleById,
  getStatusLabel,
  type LearningPiece,
  type StudentLearningPieceStatus,
} from "@/lib/domain";
import type { LmsLearningRecordOverlay } from "@/lib/lms/journey-overlay";

function getLmsStatusLabel(lmsRecord: LmsLearningRecordOverlay) {
  if (lmsRecord.completionBucket === "completed") {
    return "LMS 수료";
  }
  if (lmsRecord.completionBucket === "not_completed") {
    return "LMS 미완료";
  }
  return "LMS 기록";
}

function getLmsRecordSummary(lmsRecord: LmsLearningRecordOverlay) {
  const statusLabel =
    lmsRecord.completionStatusLabel ?? lmsRecord.participationStatusLabel ?? "상태 미확인";
  const progress =
    typeof lmsRecord.progressRate === "number" ? `진도 ${lmsRecord.progressRate}%` : "진도 없음";
  const learningTime =
    typeof lmsRecord.learningTimeMinutes === "number"
      ? `학습 ${lmsRecord.learningTimeMinutes}분`
      : "학습시간 없음";

  return `${statusLabel} · ${progress} · ${learningTime}`;
}

export function LearningPieceCard({
  learningPiece,
  status,
  lmsRecord,
}: {
  learningPiece: LearningPiece;
  status?: StudentLearningPieceStatus;
  lmsRecord?: LmsLearningRecordOverlay;
}) {
  const moduleInfo = getModuleById(learningPiece.moduleId);
  const content = getContentById(learningPiece.contentId);

  return (
    <Link
      href={`/objects/learning-pieces/${learningPiece.id}`}
      className="block rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition hover:border-teal-700"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium text-teal-800">
            {moduleInfo?.title ?? "미지정 모듈"}
          </p>
          <h2 className="mt-1 text-base font-semibold text-stone-950">{learningPiece.title}</h2>
          <p className="mt-2 text-sm text-stone-600">{learningPiece.completionRule}</p>
        </div>
        <StatusBadge>{status ? getStatusLabel(status.status) : learningPiece.pieceType}</StatusBadge>
      </div>
      <div className="mt-4 grid gap-2 text-xs text-stone-500 sm:grid-cols-3">
        <span>콘텐츠: {content?.title ?? "없음"}</span>
        <span>공개: {learningPiece.opensAt}</span>
        <span>마감: {learningPiece.dueAt}</span>
      </div>
      {lmsRecord ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3 text-xs text-stone-600">
          <StatusBadge>{getLmsStatusLabel(lmsRecord)}</StatusBadge>
          <span>{getLmsRecordSummary(lmsRecord)}</span>
        </div>
      ) : null}
    </Link>
  );
}

export function JourneyTimeline({
  items,
}: {
  items: Array<{
    status: StudentLearningPieceStatus;
    learningPiece: LearningPiece;
    lmsRecord?: LmsLearningRecordOverlay;
  }>;
}) {
  return (
    <Card title="학습 여정 타임라인" subtitle="학생 개인 기준의 학습피스 진행 흐름">
      <div className="space-y-4">
        {items.map(({ status, learningPiece, lmsRecord }) => (
          <div key={status.id} className="grid gap-3 border-b border-stone-100 pb-4 last:border-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={`/objects/learning-pieces/${learningPiece.id}`}
                className="font-medium text-stone-950 hover:text-teal-800"
              >
                {learningPiece.title}
              </Link>
              <StatusBadge>{getStatusLabel(status.status)}</StatusBadge>
            </div>
            <p className="text-sm text-stone-600">{status.note ?? learningPiece.completionRule}</p>
            {lmsRecord ? (
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
                <StatusBadge>{getLmsStatusLabel(lmsRecord)}</StatusBadge>
                <span>{getLmsRecordSummary(lmsRecord)}</span>
                {lmsRecord.completedAt ? <span>수료일 {lmsRecord.completedAt}</span> : null}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2 text-xs text-stone-500">
              <span>마감 {learningPiece.dueAt}</span>
              <span>수정 {status.updatedAt}</span>
              {status.completedAt ? <span>완료 {status.completedAt}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
