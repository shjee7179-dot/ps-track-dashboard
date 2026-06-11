import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "ps-track-dashboard",
    authProvider: process.env.AUTH_PROVIDER ?? "mock",
    repositoryProvider: process.env.REPOSITORY_PROVIDER ?? "mock",
    lmsProvider: process.env.LMS_PROVIDER ?? "none",
  });
}
