"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mockRepositories } from "@/lib/mock-repositories";
import { sessionProvider } from "@/lib/session-provider";
import type { ScopeType } from "@/lib/types";

const noticeScopeTypes: ScopeType[] = ["program", "cohort", "track", "team", "student"];

function normalizeText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function isNoticeScopeType(value: FormDataEntryValue | null): value is ScopeType {
  return typeof value === "string" && noticeScopeTypes.includes(value as ScopeType);
}

function buildRedirectPath(update: string, auditLogId?: string) {
  const params = new URLSearchParams({ update });
  if (auditLogId) params.set("audit", auditLogId);
  return `/notices/new?${params.toString()}`;
}

export async function createNoticeAction(formData: FormData) {
  const title = normalizeText(formData.get("title"));
  const body = normalizeText(formData.get("body"));
  const targetScopeType = formData.get("targetScopeType");
  const targetScopeId = normalizeText(formData.get("targetScopeId"));
  const roleParam = formData.get("role");

  if (!title || !body || !isNoticeScopeType(targetScopeType) || !targetScopeId) {
    redirect(buildRedirectPath("invalid"));
  }

  const session = await sessionProvider.requireSession({
    roleParam: typeof roleParam === "string" ? roleParam : undefined,
  });
  const decision = await sessionProvider.canAccess(session, {
    scopeType: targetScopeType,
    scopeId: targetScopeId,
    action: "create",
  });

  if (!decision.allowed) {
    redirect(buildRedirectPath("denied"));
  }

  const cohort = await mockRepositories.cohorts.getActiveCohort();
  const result = await mockRepositories.admin.createNotice({
    cohortId: cohort?.id ?? "cohort-2026",
    title,
    body,
    targetScopeType,
    targetScopeId,
    createdBy: session.user.id,
  });

  revalidatePath("/notices");
  revalidatePath("/notices/new");
  redirect(`/notices?update=created&audit=${result.auditLogId ?? "mock"}`);
}
