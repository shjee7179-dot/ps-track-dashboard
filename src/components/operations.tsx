import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import {
  getReminderStatusLabel,
  getRiskTargetName,
  getRiskTypeLabel,
  type ReminderCandidate,
  type RiskSignal,
} from "@/lib/domain";

export function RiskCard({ risk }: { risk: RiskSignal }) {
  return (
    <Link
      href="/operations/risks"
      className="block rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition hover:border-teal-700"
    >
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
    </Link>
  );
}

export function ReminderRow({ reminder }: { reminder: ReminderCandidate }) {
  return (
    <div className="grid gap-2 border-b border-stone-100 py-3 text-sm last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center">
      <div>
        <p className="font-medium text-stone-950">{getRiskTargetName(reminder)}</p>
        <p className="mt-1 text-stone-600">{reminder.reason}</p>
      </div>
      <StatusBadge>{reminder.channel}</StatusBadge>
      <StatusBadge>{getReminderStatusLabel(reminder.sendStatus)}</StatusBadge>
    </div>
  );
}
