import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import {
  getContentById,
  getModuleById,
  getStatusLabel,
} from "@/lib/domain";
import { getJourneyLmsRecordMap } from "@/lib/lms/journey-overlay";
import { repositories } from "@/lib/repositories";

const studentId = "student-001";

export default async function LearningPieceDetailPage({
  params,
}: {
  params: Promise<{ learningPieceId: string }>;
}) {
  const { learningPieceId } = await params;
  const learningPiece = await repositories.learning.getLearningPieceById(learningPieceId);
  if (!learningPiece) notFound();

  const moduleInfo = getModuleById(learningPiece.moduleId);
  const content = getContentById(learningPiece.contentId);
  const [statuses, lmsRecordMap] = await Promise.all([
    repositories.learning.listStudentLearningPieceStatuses({ studentId }),
    getJourneyLmsRecordMap(studentId),
  ]);
  const status = statuses.find((item) => item.learningPieceId === learningPiece.id);
  const lmsRecord = lmsRecordMap.get(learningPiece.id);

  return (
    <AppShell title={learningPiece.title} eyebrow="Learning Piece Detail">
      <div className="mb-6 grid gap-4 sm:grid-cols-5">
        <Stat label="유형" value={learningPiece.pieceType} tone="teal" />
        <Stat label="공개일" value={learningPiece.opensAt} />
        <Stat label="마감일" value={learningPiece.dueAt} tone="amber" />
        <Stat label="상태" value={status ? getStatusLabel(status.status) : "미지정"} />
        <Stat
          label="LMS"
          value={
            lmsRecord?.completionBucket === "completed"
              ? "수료"
              : lmsRecord
                ? "미완료"
                : "미연결"
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="완료 기준" subtitle="학습피스 유형별 완료 판정 기준">
          <p className="text-sm leading-6 text-stone-700">{learningPiece.completionRule}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {learningPiece.requiresSubmission ? <StatusBadge>제출 필요</StatusBadge> : null}
            {learningPiece.requiresApproval ? <StatusBadge>승인 필요</StatusBadge> : null}
            {learningPiece.requiresEvaluation ? <StatusBadge>평가 필요</StatusBadge> : null}
            {!learningPiece.requiresSubmission &&
            !learningPiece.requiresApproval &&
            !learningPiece.requiresEvaluation ? (
              <StatusBadge>자기 완료 체크</StatusBadge>
            ) : null}
          </div>
        </Card>
        <Card title="연결 객체">
          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="text-stone-500">모듈</dt>
              <dd className="mt-1 font-medium text-stone-950">
                {moduleInfo?.title ?? "미지정"}
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">콘텐츠</dt>
              <dd className="mt-1 font-medium text-stone-950">{content?.title ?? "미지정"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">학습성과 태그</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {learningPiece.outcomeTags.map((tag) => (
                  <StatusBadge key={tag}>{tag}</StatusBadge>
                ))}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="학생별 상태">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-stone-950">김서연</p>
              <p className="mt-1 text-sm text-stone-600">
                {status?.note ?? "아직 상태 메모가 없습니다."}
              </p>
              {lmsRecord ? (
                <p className="mt-2 text-xs text-stone-500">
                  LMS {lmsRecord.completionStatusLabel ?? "상태 미확인"} · 진도{" "}
                  {lmsRecord.progressRate ?? "-"}% · 학습 {lmsRecord.learningTimeMinutes ?? 0}분
                </p>
              ) : null}
            </div>
            <StatusBadge>{status ? getStatusLabel(status.status) : "미지정"}</StatusBadge>
          </div>
        </Card>
      </div>

      <Link
        href="/objects/learning-pieces"
        className="mt-6 inline-flex rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:border-teal-700 hover:text-teal-800"
      >
        학습피스 목록으로
      </Link>
    </AppShell>
  );
}
