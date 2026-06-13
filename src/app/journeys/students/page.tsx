import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { getStudentJourneyLmsSummary } from "@/lib/lms/journey-overlay";
import { repositories } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function StudentJourneysPage() {
  const users = await repositories.users.listUsers();
  const students = users.filter((user) => user.defaultRole === "student");
  const studentRows = await Promise.all(
    students.map(async (student) => {
      const [journey, summary] = await Promise.all([
        repositories.learning.listStudentJourney(student.id),
        repositories.learning.getJourneySummary(student.id),
      ]);
      const lmsSummary = await getStudentJourneyLmsSummary(student.id, journey);

      return {
        student,
        summary,
        lmsSummary,
      };
    }),
  );
  const lmsCompletedTotal = studentRows.reduce(
    (total, row) => total + row.lmsSummary.completedRecords,
    0,
  );
  const syncNeededTotal = studentRows.reduce(
    (total, row) => total + row.lmsSummary.completionReadyButNotSynced,
    0,
  );

  return (
    <AppShell title="학생별 학습 여정" eyebrow="Journeys / Students">
      <div className="mb-6 grid gap-4 sm:grid-cols-5">
        <Stat label="학생" value={`${students.length}명`} tone="teal" />
        <Stat label="기본 축" value="학생 개인" />
        <Stat label="필터" value="모듈 / 일정" />
        <Stat label="LMS 완료" value={`${lmsCompletedTotal}건`} />
        <Stat
          label="상태 미반영"
          value={`${syncNeededTotal}건`}
          tone={syncNeededTotal > 0 ? "amber" : "neutral"}
        />
      </div>
      <Card title="학생 목록" subtitle="학생 개인 기준으로 현재 위치와 조치 필요 항목을 확인">
        <div className="space-y-3">
          {studentRows.map(({ student, summary, lmsSummary }) => {
            return (
              <Link
                key={student.id}
                href={`/journeys/students/${student.id}`}
                className="grid gap-3 rounded-lg border border-stone-200 p-4 transition hover:border-teal-700 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-medium text-stone-950">{student.name}</p>
                  <p className="mt-1 text-sm text-stone-500">{student.email}</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <StatusBadge>완료 {summary?.completed ?? 0}/{summary?.total ?? 0}</StatusBadge>
                  <StatusBadge>조치 {summary?.needsAction ?? 0}</StatusBadge>
                  <StatusBadge>{summary?.completionRate ?? 0}%</StatusBadge>
                  <StatusBadge>LMS 완료 {lmsSummary.completedRecords}</StatusBadge>
                  {lmsSummary.completionReadyButNotSynced > 0 ? (
                    <StatusBadge>미반영 {lmsSummary.completionReadyButNotSynced}</StatusBadge>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </AppShell>
  );
}
