import { NextResponse } from "next/server";

import { getKeycloakDiagnostics } from "@/lib/keycloak/diagnostics";

export async function GET() {
  const diagnostics = await getKeycloakDiagnostics();

  return NextResponse.json(diagnostics, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
