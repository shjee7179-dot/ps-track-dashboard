import { AppShell } from "@/components/app-shell";
import { Card, Stat } from "@/components/ui";
import { systemSettings } from "@/lib/domain";

export default function SettingsPage() {
  return (
    <AppShell title="전체 시스템 설정" eyebrow="Admin / Settings">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="설정 항목" value={`${systemSettings.length}개`} tone="teal" />
        <Stat label="운영 모드" value="2026 1기" />
        <Stat label="설문 빌더" value="1차 제외" tone="amber" />
      </div>
      <Card title="시스템 설정" subtitle="Sprint 0 key-value 설정 초안">
        <div className="divide-y divide-stone-100">
          {systemSettings.map((setting) => (
            <div key={setting.key} className="grid gap-2 py-4 text-sm sm:grid-cols-[220px_1fr]">
              <div>
                <p className="font-medium text-stone-950">{setting.label}</p>
                <p className="mt-1 text-xs text-stone-500">{setting.key}</p>
              </div>
              <p className="text-stone-700">{setting.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
