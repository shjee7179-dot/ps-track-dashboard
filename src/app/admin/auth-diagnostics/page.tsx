import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { getKeycloakDiagnostics } from "@/lib/keycloak/diagnostics";

const headerLabels = {
  subject: "사용자 UUID",
  username: "로그인 ID",
  email: "이메일",
};

const policyStatusLabels = {
  ready: "앱 준비",
  pending: "정책 필요",
  external: "Gateway 연계",
};

export default async function AuthDiagnosticsPage() {
  const diagnostics = await getKeycloakDiagnostics();
  const isKeycloak = diagnostics.authProvider === "keycloak";
  const presentCount = Object.values(diagnostics.received).filter((item) => item.present).length;

  return (
    <AppShell title="인증 진단" eyebrow="Admin / Auth Diagnostics">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Auth provider"
          value={diagnostics.authProvider}
          tone={isKeycloak ? "teal" : "amber"}
        />
        <Stat
          label="수신 헤더"
          value={`${presentCount}/3`}
          tone={presentCount === 3 ? "teal" : "amber"}
        />
        <Stat label="세션 원천" value="LMS gateway" />
      </div>

      <Card title="Trusted header 상태" subtitle="Keycloak JWT 검증 후 gateway가 전달해야 하는 식별 헤더">
        <div className="grid gap-3">
          {Object.entries(diagnostics.expectedHeaders).map(([key, headerName]) => {
            const received = diagnostics.received[key as keyof typeof diagnostics.received];

            return (
              <div
                key={key}
                className="grid gap-3 rounded-lg border border-stone-200 p-4 sm:grid-cols-[1fr_1fr_auto]"
              >
                <div>
                  <p className="text-sm font-medium text-stone-950">
                    {headerLabels[key as keyof typeof headerLabels]}
                  </p>
                  <p className="mt-1 font-mono text-xs text-stone-500">{headerName}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">마스킹 미리보기</p>
                  <p className="mt-1 font-mono text-sm text-stone-800">
                    {received.preview ?? "-"}
                  </p>
                </div>
                <div className="self-start sm:self-center">
                  <StatusBadge>{received.present ? "수신" : "미수신"}</StatusBadge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-6">
        <Card title="Keycloak 세션 기준" subtitle="운영팀 등록 전 공유할 realm, client, session timeout 기준">
          <div className="grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
            <div className="rounded-lg border border-stone-200 p-4">
              <p className="text-xs text-stone-500">Realm</p>
              <p className="mt-1 font-mono text-sm text-stone-900">{diagnostics.sessionPolicy.realm}</p>
            </div>
            <div className="rounded-lg border border-stone-200 p-4">
              <p className="text-xs text-stone-500">Client ID</p>
              <p className="mt-1 font-mono text-sm text-stone-900">{diagnostics.sessionPolicy.clientId}</p>
            </div>
            <div className="rounded-lg border border-stone-200 p-4">
              <p className="text-xs text-stone-500">SSO idle / max</p>
              <p className="mt-1 text-sm text-stone-900">
                {diagnostics.sessionPolicy.idleTimeout} / {diagnostics.sessionPolicy.maxTimeout}
              </p>
            </div>
            <div className="rounded-lg border border-stone-200 p-4">
              <p className="text-xs text-stone-500">Post logout</p>
              <p className="mt-1 font-mono text-sm text-stone-900">
                {diagnostics.sessionPolicy.postLogoutRedirectPath}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="접속 로그 정책" subtitle="로그인/로그아웃/세션 갱신은 gateway 연계 후 최종 확정">
          <div className="grid gap-3">
            {diagnostics.accessLogPolicy.map((item) => (
              <div
                key={item.key}
                className="grid gap-3 rounded-lg border border-stone-200 p-4 lg:grid-cols-[160px_1fr_auto]"
              >
                <div>
                  <p className="text-sm font-medium text-stone-950">{item.label}</p>
                  <p className="mt-1 text-xs text-stone-500">{item.event}</p>
                </div>
                <p className="text-sm leading-6 text-stone-700">{item.note}</p>
                <div className="self-start lg:self-center">
                  <StatusBadge>{policyStatusLabels[item.status]}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="운영 전제" subtitle="최종 URL 등록 전 내부 검증 기준">
          <ul className="space-y-2 text-sm leading-6 text-stone-700">
            {diagnostics.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
            <li>
              이 화면은 원문 토큰이나 전체 개인정보를 표시하지 않고, 헤더 존재 여부와 짧은 마스킹 값만
              확인한다.
            </li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
