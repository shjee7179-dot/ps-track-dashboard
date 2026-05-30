import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import {
  getLearningPieceById,
  getStatusLabel,
  getStudentById,
  studentLearningPieceStatuses,
} from "@/lib/domain";

export default function JourneyStatusPage() {
  const actionItems = studentLearningPieceStatuses.filter((item) =>
    ["in_progress", "needs_submission", "pending_review", "delayed"].includes(item.status),
  );

  return (
    <AppShell title="학습피스 상태 관리" eyebrow="Journeys / Status">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="상태 레코드" value={`${studentLearningPieceStatuses.length}건`} tone="teal" />
        <Stat label="조치 대상" value={`${actionItems.length}건`} tone="amber" />
        <Stat label="상태 변경 로그" value="Sprint 1 mock" />
      </div>
      <Card title="상태 관리 큐" subtitle="운영자/멘토가 학생별 학습피스 상태를 확인">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="py-3 pr-4 font-medium">학생</th>
                <th className="py-3 pr-4 font-medium">학습피스</th>
                <th className="py-3 pr-4 font-medium">상태</th>
                <th className="py-3 pr-4 font-medium">수정일</th>
                <th className="py-3 font-medium">메모</th>
              </tr>
            </thead>
            <tbody>
              {studentLearningPieceStatuses.map((item) => (
                <tr key={item.id} className="border-b border-stone-100">
                  <td className="py-3 pr-4 font-medium text-stone-950">
                    {getStudentById(item.studentId)?.name ?? item.studentId}
                  </td>
                  <td className="py-3 pr-4 text-stone-600">
                    {getLearningPieceById(item.learningPieceId)?.title ?? item.learningPieceId}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge>{getStatusLabel(item.status)}</StatusBadge>
                  </td>
                  <td className="py-3 pr-4 text-stone-600">{item.updatedAt}</td>
                  <td className="py-3 text-stone-600">{item.note ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
