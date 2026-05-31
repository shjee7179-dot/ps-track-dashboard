import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { updateLearningPieceStatusAction } from "@/app/journeys/status/actions";
import {
  getLearningPieceById,
  getStatusLabel,
  getStudentById,
  studentLearningPieceStatuses,
  type LearningPieceStatus,
} from "@/lib/domain";

const editableStatuses: LearningPieceStatus[] = [
  "locked",
  "not_started",
  "in_progress",
  "needs_submission",
  "pending_review",
  "revising",
  "pending_evaluation",
  "completed",
  "delayed",
];

const updateMessages: Record<string, string> = {
  accepted: "상태 변경 요청이 mock repository를 통해 접수되었습니다.",
  denied: "현재 역할/scope에서는 이 상태를 변경할 수 없습니다.",
  invalid: "상태 변경 요청 값이 올바르지 않습니다.",
  missing: "상태 레코드를 찾을 수 없습니다.",
};

export default async function JourneyStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; update?: string; audit?: string }>;
}) {
  const params = await searchParams;
  const actionItems = studentLearningPieceStatuses.filter((item) =>
    ["in_progress", "needs_submission", "pending_review", "delayed"].includes(item.status),
  );
  const updateMessage = params.update ? updateMessages[params.update] : undefined;

  return (
    <AppShell title="학습피스 상태 관리" eyebrow="Journeys / Status">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="상태 레코드" value={`${studentLearningPieceStatuses.length}건`} tone="teal" />
        <Stat label="조치 대상" value={`${actionItems.length}건`} tone="amber" />
        <Stat label="상태 변경 로그" value="Sprint 1 mock" />
      </div>
      {updateMessage ? (
        <div className="mb-4 rounded-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
          {updateMessage}
          {params.audit ? <span className="ml-2 text-stone-500">audit: {params.audit}</span> : null}
        </div>
      ) : null}
      <Card title="상태 관리 큐" subtitle="운영자/멘토가 학생별 학습피스 상태를 확인하고 mock action으로 변경">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="py-3 pr-4 font-medium">학생</th>
                <th className="py-3 pr-4 font-medium">학습피스</th>
                <th className="py-3 pr-4 font-medium">상태</th>
                <th className="py-3 pr-4 font-medium">수정일</th>
                <th className="py-3 pr-4 font-medium">메모</th>
                <th className="py-3 font-medium">상태 변경</th>
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
                  <td className="py-3 pr-4 text-stone-600">{item.note ?? "-"}</td>
                  <td className="py-3">
                    <form action={updateLearningPieceStatusAction} className="flex gap-2">
                      <input type="hidden" name="statusId" value={item.id} />
                      <input type="hidden" name="role" value={params.role ?? "admin"} />
                      <select
                        name="nextStatus"
                        defaultValue={item.status}
                        className="h-9 rounded-md border border-stone-200 bg-white px-2 text-xs text-stone-700"
                      >
                        {editableStatuses.map((status) => (
                          <option key={status} value={status}>
                            {getStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="h-9 rounded-md border border-teal-700 bg-teal-700 px-3 text-xs font-medium text-white"
                      >
                        변경
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
