import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { JourneyTimeline } from "@/components/journey";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { applyLmsCompletionToLearningPieceStatusAction } from "@/app/journeys/students/[studentId]/actions";
import { attachLmsRecordsToJourney } from "@/lib/lms/journey-overlay";
import { repositories } from "@/lib/repositories";
import { getStatusLabel } from "@/lib/domain";

const lmsSyncMessages: Record<string, string> = {
  accepted: "LMS 수료 근거를 확인하고 PS Track 상태를 완료로 반영했습니다.",
  denied: "현재 역할/scope에서는 이 학생의 상태를 변경할 수 없습니다.",
  invalid: "LMS 수료 반영 요청 값이 올바르지 않습니다.",
  missing: "상태 레코드를 찾을 수 없습니다.",
  "not-ready": "LMS 수료 완료 근거가 있는 항목만 반영할 수 있습니다.",
  "already-completed": "이미 완료 처리된 학습피스입니다.",
};

export default async function StudentJourneyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ role?: string; lmsSync?: string; audit?: string }>;
}) {
  const { studentId } = await params;
  const query = await searchParams;
  const [student, baseJourney, summary, activityLogs] = await Promise.all([
    repositories.users.getUserById(studentId),
    repositories.learning.listStudentJourney(studentId),
    repositories.learning.getJourneySummary(studentId),
    repositories.admin.listActivityLogs({ studentId }),
  ]);

  if (!student || student.defaultRole !== "student") notFound();

  const journey = await attachLmsRecordsToJourney(studentId, baseJourney);
  const lmsCompleted = journey.filter(
    (item) => item.lmsRecord?.completionBucket === "completed",
  ).length;
  const lmsCompletionReadyItems = journey.filter(
    (item) => item.lmsRecord?.completionBucket === "completed" && item.status.status !== "completed",
  );
  const lmsSyncMessage = query.lmsSync ? lmsSyncMessages[query.lmsSync] : undefined;

  return (
    <AppShell title={`${student.name} 학습 여정`} eyebrow="Student Journey Detail">
      <div className="mb-6 grid gap-4 sm:grid-cols-5">
        <Stat label="전체" value={`${summary.total}개`} tone="teal" />
        <Stat label="완료" value={`${summary.completed}개`} />
        <Stat label="조치 필요" value={`${summary.needsAction}개`} tone="amber" />
        <Stat label="지연" value={`${summary.delayed}개`} />
        <Stat label="LMS 완료" value={`${lmsCompleted}개`} />
      </div>
      {lmsSyncMessage ? (
        <div className="mb-4 rounded-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
          {lmsSyncMessage}
          {query.audit ? <span className="ml-2 text-stone-500">audit: {query.audit}</span> : null}
        </div>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <JourneyTimeline items={journey} />
        <div className="space-y-6">
          <Card
            title="LMS 수료 반영 대기"
            subtitle="LMS 완료 근거가 있지만 PS Track 상태가 아직 완료가 아닌 항목"
          >
            {lmsCompletionReadyItems.length > 0 ? (
              <div className="space-y-3">
                {lmsCompletionReadyItems.map(({ status, learningPiece, lmsRecord }) => (
                  <div
                    key={status.id}
                    className="grid gap-3 border-b border-stone-100 pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-stone-950">{learningPiece.title}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        LMS {lmsRecord?.completionStatusLabel ?? "수료"} · 진도{" "}
                        {lmsRecord?.progressRate ?? "-"}% · 현재 {getStatusLabel(status.status)}
                      </p>
                    </div>
                    <form action={applyLmsCompletionToLearningPieceStatusAction}>
                      <input type="hidden" name="studentId" value={studentId} />
                      <input type="hidden" name="statusId" value={status.id} />
                      <input type="hidden" name="learningPieceId" value={learningPiece.id} />
                      <input type="hidden" name="role" value={query.role ?? "admin"} />
                      <button
                        type="submit"
                        className="h-9 rounded-md border border-teal-700 bg-teal-700 px-3 text-xs font-medium text-white"
                      >
                        완료 반영
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-stone-600">현재 반영 대기 항목이 없습니다.</p>
                <StatusBadge>정상</StatusBadge>
              </div>
            )}
          </Card>
          <Card title="활동 로그" subtitle="1차는 핵심 이벤트 중심으로 기록">
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log.id} className="border-b border-stone-100 pb-3 last:border-0">
                  <p className="text-sm font-medium text-stone-950">{log.target}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    {log.eventType} / {log.occurredAt}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">{log.detail}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
