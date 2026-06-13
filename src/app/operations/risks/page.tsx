import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { updateReminderStatusAction, updateRiskStatusAction } from "@/app/operations/risks/actions";
import {
  getReminderStatusLabel,
  getRiskTargetName,
  getRiskTypeLabel,
} from "@/lib/domain";
import { repositories } from "@/lib/repositories";

const riskStatusOptions = [
  { value: "open", label: "열림" },
  { value: "in_progress", label: "조치 중" },
  { value: "resolved", label: "해결" },
];

const reminderStatusOptions = [
  { value: "pending", label: "발송 대기" },
  { value: "sent", label: "발송 완료" },
  { value: "skipped", label: "보류" },
];

const updateMessages: Record<string, string> = {
  "risk-saved": "위험 신호 조치 상태가 저장되었습니다.",
  "reminder-saved": "리마인드 발송 상태가 저장되었습니다.",
  denied: "현재 역할/scope에서는 이 운영 조치를 수행할 수 없습니다.",
  invalid: "조치 요청 값이 올바르지 않습니다.",
  missing: "조치 대상 레코드를 찾을 수 없습니다.",
};

export default async function RisksPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; update?: string; audit?: string }>;
}) {
  const query = await searchParams;
  const [riskSignals, reminderCandidates] = await Promise.all([
    repositories.operations.listRiskSignals(),
    repositories.operations.listReminderCandidates(),
  ]);
  const updateMessage = query.update ? updateMessages[query.update] : undefined;

  return (
    <AppShell title="위험군 / 리마인드 추천" eyebrow="Operations / Risks">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="위험 신호" value={`${riskSignals.length}건`} tone="teal" />
        <Stat
          label="학습 지연"
          value={`${riskSignals.filter((risk) => risk.riskType === "learning_piece_delay").length}건`}
        />
        <Stat
          label="산출물"
          value={`${riskSignals.filter((risk) => risk.riskType === "artifact_missing").length}건`}
          tone="amber"
        />
        <Stat
          label="멘토링"
          value={`${riskSignals.filter((risk) => risk.riskType === "mentoring_issue").length}건`}
        />
      </div>

      {updateMessage ? (
        <div className="mb-4 rounded-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
          {updateMessage}
          {query.audit ? <span className="ml-2 text-stone-500">audit: {query.audit}</span> : null}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          {riskSignals.map((risk) => (
            <article key={risk.id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-teal-800">{getRiskTargetName(risk)}</p>
                  <h2 className="mt-1 text-base font-semibold text-stone-950">
                    {getRiskTypeLabel(risk.riskType)}
                  </h2>
                  <p className="mt-2 text-sm text-stone-600">{risk.actionNote}</p>
                </div>
                <StatusBadge>{risk.severity}</StatusBadge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-500">
                <span>{risk.actionStatus}</span>
                <span>{risk.relatedObjectType}</span>
              </div>
              <form action={updateRiskStatusAction} className="mt-4 flex flex-wrap gap-2">
                <input type="hidden" name="riskSignalId" value={risk.id} />
                <input type="hidden" name="role" value={query.role ?? "operator"} />
                <select
                  name="nextStatus"
                  defaultValue={risk.actionStatus}
                  className="h-9 rounded-md border border-stone-200 bg-white px-2 text-xs text-stone-700"
                >
                  {riskStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="h-9 rounded-md border border-teal-700 bg-teal-700 px-3 text-xs font-medium text-white"
                >
                  조치 저장
                </button>
              </form>
            </article>
          ))}
        </section>
        <Card title="리마인드 대상 추천" subtitle="자동 추천, 발송은 수동">
          {reminderCandidates.map((reminder) => (
            <div key={reminder.id} className="border-b border-stone-100 py-3 text-sm last:border-0">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  <p className="font-medium text-stone-950">{getRiskTargetName(reminder)}</p>
                  <p className="mt-1 text-stone-600">{reminder.reason}</p>
                </div>
                <StatusBadge>{reminder.channel}</StatusBadge>
                <StatusBadge>{getReminderStatusLabel(reminder.sendStatus)}</StatusBadge>
              </div>
              <form action={updateReminderStatusAction} className="mt-3 flex flex-wrap gap-2">
                <input type="hidden" name="reminderId" value={reminder.id} />
                <input type="hidden" name="role" value={query.role ?? "operator"} />
                <select
                  name="nextStatus"
                  defaultValue={reminder.sendStatus}
                  className="h-9 rounded-md border border-stone-200 bg-white px-2 text-xs text-stone-700"
                >
                  {reminderStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="h-9 rounded-md border border-stone-900 bg-stone-900 px-3 text-xs font-medium text-white"
                >
                  발송 상태 저장
                </button>
              </form>
            </div>
          ))}
        </Card>
      </div>
    </AppShell>
  );
}
