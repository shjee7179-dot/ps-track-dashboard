import "server-only";

import { getAuthProviderName } from "@/lib/session-provider";
import { getKeycloakHeaderNames, getKeycloakHeaderSnapshot } from "@/lib/keycloak/session-provider";

function previewValue(value: string | null) {
  if (!value) {
    return null;
  }

  if (value.length <= 8) {
    return `${value.slice(0, 2)}...${value.slice(-1)}`;
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export async function getKeycloakDiagnostics() {
  const headerNames = getKeycloakHeaderNames();
  const snapshot = await getKeycloakHeaderSnapshot();

  return {
    authProvider: getAuthProviderName(),
    expectedHeaders: headerNames,
    received: {
      subject: {
        present: Boolean(snapshot.subject),
        preview: previewValue(snapshot.subject),
      },
      username: {
        present: Boolean(snapshot.username),
        preview: previewValue(snapshot.username),
      },
      email: {
        present: Boolean(snapshot.email),
        preview: previewValue(snapshot.email),
      },
    },
    notes: [
      "AlphaCampus/LMS gateway validates Keycloak JWT before forwarding identity headers.",
      "PS Track only resolves a local role assignment after a trusted subject header is present.",
    ],
  };
}
