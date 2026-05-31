import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { pwaQualityChecks, pwaSettings } from "@/lib/domain";

const pwaStatusLabels = {
  pass: "통과",
  warning: "확인 필요",
  fail: "실패",
};

export default function PwaPage() {
  return (
    <AppShell title="PWA 설정" eyebrow="Admin / PWA">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="설치 가능 상태" value={pwaSettings.installable ? "가능" : "불가"} tone="teal" />
        <Stat label="표시 방식" value={pwaSettings.display} />
        <Stat label="푸시 알림" value="1차 제외" tone="amber" />
      </div>
      <Card title="Manifest 설정" subtitle="1차 PWA 기본 설정">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-stone-500">앱 이름</dt>
            <dd className="mt-1 font-medium text-stone-950">{pwaSettings.appName}</dd>
          </div>
          <div>
            <dt className="text-stone-500">짧은 이름</dt>
            <dd className="mt-1 font-medium text-stone-950">{pwaSettings.shortName}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Theme color</dt>
            <dd className="mt-1 flex items-center gap-2 font-medium text-stone-950">
              <span className="h-4 w-4 rounded-sm bg-teal-700" />
              {pwaSettings.themeColor}
            </dd>
          </div>
          <div>
            <dt className="text-stone-500">오프라인 학습</dt>
            <dd className="mt-1">
              <StatusBadge>1차 제외</StatusBadge>
            </dd>
          </div>
        </dl>
      </Card>
      <div className="mt-6">
        <Card title="PWA 품질 체크" subtitle="설치 가능성과 모바일웹앱 품질을 점검">
          <div className="space-y-3">
            {pwaQualityChecks.map((check) => (
              <div key={check.id} className="rounded-lg border border-stone-200 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-stone-950">{check.label}</p>
                    <p className="mt-1 text-sm text-stone-600">{check.detail}</p>
                  </div>
                  <StatusBadge>{pwaStatusLabels[check.status]}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
