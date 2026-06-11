import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { JourneyTimeline } from "@/components/journey";
import { Card, Stat } from "@/components/ui";
import { attachLmsRecordsToJourney } from "@/lib/lms/journey-overlay";
import { repositories } from "@/lib/repositories";

export default async function StudentJourneyDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
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

  return (
    <AppShell title={`${student.name} 학습 여정`} eyebrow="Student Journey Detail">
      <div className="mb-6 grid gap-4 sm:grid-cols-5">
        <Stat label="전체" value={`${summary.total}개`} tone="teal" />
        <Stat label="완료" value={`${summary.completed}개`} />
        <Stat label="조치 필요" value={`${summary.needsAction}개`} tone="amber" />
        <Stat label="지연" value={`${summary.delayed}개`} />
        <Stat label="LMS 완료" value={`${lmsCompleted}개`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <JourneyTimeline items={journey} />
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
    </AppShell>
  );
}
