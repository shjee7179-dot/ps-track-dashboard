import { AppShell } from "@/components/app-shell";
import { RiskCard, ReminderRow } from "@/components/operations";
import { Card, Stat } from "@/components/ui";
import { reminderCandidates, riskSignals } from "@/lib/domain";

export default function RisksPage() {
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
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          {riskSignals.map((risk) => (
            <RiskCard key={risk.id} risk={risk} />
          ))}
        </section>
        <Card title="리마인드 대상 추천" subtitle="자동 추천, 발송은 수동">
          {reminderCandidates.map((reminder) => (
            <ReminderRow key={reminder.id} reminder={reminder} />
          ))}
        </Card>
      </div>
    </AppShell>
  );
}
