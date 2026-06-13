import "server-only";

export type KeycloakAccessPolicyItem = {
  key: string;
  label: string;
  event: string;
  status: "ready" | "pending" | "external";
  note: string;
};

export function getKeycloakSessionPolicy() {
  return {
    realm: process.env.KEYCLOAK_REALM?.trim() || "kird",
    clientId: process.env.KEYCLOAK_CLIENT_ID?.trim() || "kird-ps-track-dashboard",
    idleTimeout: process.env.KEYCLOAK_SSO_IDLE_TIMEOUT?.trim() || "2시간",
    maxTimeout: process.env.KEYCLOAK_SSO_MAX_TIMEOUT?.trim() || "10시간",
    logoutUrl:
      process.env.KEYCLOAK_LOGOUT_URL?.trim() ||
      "https://alpha-campus.kr/auth/realms/kird/protocol/openid-connect/logout",
    postLogoutRedirectPath: process.env.KEYCLOAK_POST_LOGOUT_REDIRECT_PATH?.trim() || "/login",
  };
}

export function getKeycloakAccessLogPolicy(): KeycloakAccessPolicyItem[] {
  return [
    {
      key: "session-resolution",
      label: "세션 확인",
      event: "세션 확인 / 역할 선택",
      status: "ready",
      note: "현재 server action의 requireSession 경로에서 best-effort access log를 남긴다.",
    },
    {
      key: "login",
      label: "로그인",
      event: "로그인 성공",
      status: "external",
      note: "Keycloak 로그인은 AlphaCampus/LMS gateway가 수행하므로 gateway request id와 함께 연계해야 한다.",
    },
    {
      key: "logout",
      label: "로그아웃",
      event: "로그아웃 요청 / 로그아웃 완료",
      status: "external",
      note: "Keycloak logout URL과 post_logout_redirect_uri 등록 후 gateway 또는 logout landing에서 기록한다.",
    },
    {
      key: "refresh",
      label: "세션 갱신",
      event: "SSO 세션 갱신",
      status: "external",
      note: "토큰 refresh는 gateway 경계에서 관측되므로 PS Track은 전달받은 session hint 또는 gateway log id를 저장한다.",
    },
    {
      key: "client-context",
      label: "접속 맥락",
      event: "IP / User-Agent / Gateway request id",
      status: "pending",
      note: "운영망 reverse proxy에서 신뢰 가능한 header 이름과 마스킹/보존 기간을 확정해야 한다.",
    },
  ];
}
