import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { getJourneySummary, users } from "@/lib/domain";

export default function StudentJourneysPage() {
  const students = users.filter((user) => user.defaultRole === "student");

  return (
    <AppShell title="학생별 학습 여정" eyebrow="Journeys / Students">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="학생" value={`${students.length}명`} tone="teal" />
        <Stat label="기본 축" value="학생 개인" />
        <Stat label="필터" value="모듈 / 일정" />
      </div>
      <Card title="학생 목록" subtitle="학생 개인 기준으로 현재 위치와 조치 필요 항목을 확인">
        <div className="space-y-3">
          {students.map((student) => {
            const summary = getJourneySummary(student.id);
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
                  <StatusBadge>완료 {summary.completed}/{summary.total}</StatusBadge>
                  <StatusBadge>조치 {summary.needsAction}</StatusBadge>
                  <StatusBadge>{summary.completionRate}%</StatusBadge>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </AppShell>
  );
}
