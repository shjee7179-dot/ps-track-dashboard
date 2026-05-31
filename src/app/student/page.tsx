import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { JourneyTimeline, LearningPieceCard } from "@/components/journey";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { mockRepositories } from "@/lib/mock-repositories";
import type { LearningPiece, StudentLearningPieceStatus } from "@/lib/domain";

const studentId = "student-001";

function getJourneyItems(
  statuses: StudentLearningPieceStatus[],
  learningPieces: LearningPiece[],
) {
  return statuses
    .map((status) => ({
      status,
      learningPiece: learningPieces.find((piece) => piece.id === status.learningPieceId),
    }))
    .filter(
      (item): item is { status: StudentLearningPieceStatus; learningPiece: LearningPiece } =>
        Boolean(item.learningPiece),
    );
}

function getJourneySummary(items: Array<{ status: StudentLearningPieceStatus }>) {
  const completed = items.filter((item) => item.status.status === "completed").length;
  const delayed = items.filter((item) => item.status.status === "delayed").length;
  const needsAction = items.filter((item) =>
    ["needs_submission", "pending_review", "revising", "in_progress"].includes(item.status.status),
  ).length;

  return {
    total: items.length,
    completed,
    delayed,
    needsAction,
    completionRate: items.length ? Math.round((completed / items.length) * 100) : 0,
  };
}

export default async function StudentDashboardPage() {
  const [student, learningPieces, statuses, activityLogs] = await Promise.all([
    mockRepositories.users.getUserById(studentId),
    mockRepositories.learning.listLearningPieces(),
    mockRepositories.learning.listStudentLearningPieceStatuses({ studentId }),
    mockRepositories.admin.listActivityLogs({ studentId }),
  ]);
  const journey = getJourneyItems(statuses, learningPieces);
  const summary = getJourneySummary(journey);
  const currentItems = journey.filter((item) =>
    ["in_progress", "needs_submission", "pending_review"].includes(item.status.status),
  );

  return (
    <AppShell title="학생 대시보드" eyebrow={`${student?.name ?? "학생"} / 이번 주 할 일`}>
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="전체 학습피스" value={`${summary.total}개`} tone="teal" />
        <Stat label="완료" value={`${summary.completed}개`} />
        <Stat label="조치 필요" value={`${summary.needsAction}개`} tone="amber" />
        <Stat label="완료율" value={`${summary.completionRate}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-stone-950">오늘 / 이번 주 해야 할 일</h2>
            <Link href="/objects/learning-pieces" className="text-sm font-medium text-teal-800">
              전체 보기
            </Link>
          </div>
          {currentItems.map(({ learningPiece, status }) => (
            <LearningPieceCard
              key={learningPiece.id}
              learningPiece={learningPiece}
              status={status}
            />
          ))}
        </section>

        <section className="space-y-6">
          <Card title="예정된 멘토링" subtitle="Sprint 2에서 실제 멘토링 객체와 연결">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-stone-950">연구 관심사 피드백</p>
                <p className="mt-1 text-sm text-stone-500">2026-07-18 19:00 / 외부 회의 링크 예정</p>
              </div>
              <StatusBadge>예정</StatusBadge>
            </div>
          </Card>
          <Card title="최근 활동">
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log.id} className="border-b border-stone-100 pb-3 last:border-0">
                  <p className="text-sm font-medium text-stone-950">{log.target}</p>
                  <p className="mt-1 text-xs text-stone-500">{log.occurredAt}</p>
                  <p className="mt-1 text-sm text-stone-600">{log.detail}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>

      <div className="mt-6">
        <JourneyTimeline items={journey} />
      </div>
    </AppShell>
  );
}
