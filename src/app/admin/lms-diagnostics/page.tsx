import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { getLmsProviderName, getLmsReadonlyViewAdapter } from "@/lib/lms/readonly-adapter";
import { getReadinessReport } from "@/lib/readiness";

export const dynamic = "force-dynamic";

export default async function LmsDiagnosticsPage() {
  const readiness = await getReadinessReport();
  const lmsProvider = getLmsProviderName();
  const lmsCheck = readiness.checks.find((check) => check.key === "lms");
  const catalog = lmsProvider === "none" ? [] : await getLmsReadonlyViewAdapter().listContentCatalog();

  return (
    <AppShell title="LMS 진단" eyebrow="Admin / LMS Diagnostics">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="LMS provider" value={lmsProvider} tone={lmsProvider === "none" ? "amber" : "teal"} />
        <Stat label="Readiness" value={readiness.ok ? "ready" : "check"} tone={readiness.ok ? "teal" : "amber"} />
        <Stat label="Catalog" value={`${catalog.length}개`} />
        <Stat label="Repository" value={readiness.providers.repository} />
      </div>

      <Card title="Provider readiness" subtitle="/api/ready와 같은 기준으로 provider 상태를 확인">
        <div className="grid gap-3">
          {readiness.checks.map((check) => (
            <div
              key={check.key}
              className="grid gap-3 rounded-lg border border-stone-200 p-4 lg:grid-cols-[180px_1fr_auto]"
            >
              <div>
                <p className="text-sm font-medium text-stone-950">{check.label}</p>
                <p className="mt-1 text-xs text-stone-500">{check.latencyMs ?? 0}ms</p>
              </div>
              <p className="text-sm leading-6 text-stone-700">{check.detail}</p>
              <div className="self-start lg:self-center">
                <StatusBadge>{check.status}</StatusBadge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6">
        <Card title="LMS catalog sample" subtitle="현재 provider에서 조회 가능한 LMS 콘텐츠 view 결과">
          {catalog.length > 0 ? (
            <div className="grid gap-3">
              {catalog.slice(0, 8).map((record) => (
                <div
                  key={`${record.lmsContentId}:${record.lmsCourseRoundId ?? ""}`}
                  className="rounded-lg border border-stone-200 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-stone-950">{record.contentTitle}</p>
                      <p className="mt-1 font-mono text-xs text-stone-500">
                        {record.lmsContentId}
                        {record.lmsCourseRoundId ? ` / ${record.lmsCourseRoundId}` : ""}
                      </p>
                    </div>
                    <StatusBadge>
                      {record.contentGroup} / {record.contentType}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">
                    {record.courseRoundTitle ?? "차수 없음"} · {record.openStatusLabel ?? "상태 미확인"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-600">
              현재 provider에서 표시할 LMS catalog가 없습니다. `LMS_PROVIDER`와 readonly view 설정을 확인하세요.
            </p>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card title="운영 기준" subtitle="실제 AlphaCampus 연계 전 확인할 경계">
          <ul className="space-y-2 text-sm leading-6 text-stone-700">
            <li>PS Track은 LMS 원본 테이블이 아니라 운영팀이 제공한 readonly view만 조회한다.</li>
            <li>앱 전용 DB 연결과 LMS readonly DB 연결은 각각 `DATABASE_URL`, `LMS_DATABASE_URL`로 분리한다.</li>
            <li>운영 DB 접속 정보와 view 명세가 확정되기 전에는 local mock LMS view로만 smoke test한다.</li>
            <li>{lmsCheck ? `현재 LMS check: ${lmsCheck.detail}` : "현재 LMS check를 찾을 수 없습니다."}</li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
