"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { repositories } from "@/lib/repositories";
import { sessionProvider } from "@/lib/session-provider";
import type { MentoringSession } from "@/lib/types";

const allowedStatuses: MentoringSession["status"][] = [
  "scheduled",
  "completed",
  "absent",
  "cancelled",
];

function normalizeText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function isMentoringStatus(value: FormDataEntryValue | null): value is MentoringSession["status"] {
  return typeof value === "string" && allowedStatuses.includes(value as MentoringSession["status"]);
}

function buildRedirectPath(sessionId: string, update: string, auditLogId?: string) {
  const params = new URLSearchParams({ update });
  if (auditLogId) params.set("audit", auditLogId);
  return `/mentoring/sessions/${sessionId}?${params.toString()}`;
}

export async function updateMentoringRecordAction(formData: FormData) {
  const sessionId = formData.get("sessionId");
  const roleParam = formData.get("role");
  const status = formData.get("status");
  const notes = normalizeText(formData.get("notes"));
  const nextActionsText = normalizeText(formData.get("nextActions"));

  if (typeof sessionId !== "string" || !isMentoringStatus(status) || !notes) {
    redirect("/mentoring/sessions?update=invalid");
  }

  const sessionRecord = await repositories.operations.getMentoringSessionById(sessionId);
  if (!sessionRecord) {
    redirect("/mentoring/sessions?update=missing");
  }

  const session = await sessionProvider.requireSession({
    roleParam: typeof roleParam === "string" ? roleParam : undefined,
  });
  const decision = await sessionProvider.canAccess(session, {
    scopeType: sessionRecord.targetType,
    scopeId: sessionRecord.targetId,
    action: "update",
  });

  if (!decision.allowed) {
    redirect(buildRedirectPath(sessionRecord.id, "denied"));
  }

  const nextActions =
    nextActionsText
      ?.split("\n")
      .map((item) => item.trim())
      .filter(Boolean) ?? [];

  const result = await repositories.operations.updateMentoringSessionRecord({
    sessionId: sessionRecord.id,
    status,
    notes,
    nextActions,
    audit: {
      actorId: session.user.id,
      actorLabel: session.user.name,
      metadata: {
        role: session.activeRole,
        source: session.source,
      },
    },
  });

  revalidatePath(`/mentoring/sessions/${sessionRecord.id}`);
  revalidatePath("/mentoring/sessions");
  redirect(buildRedirectPath(sessionRecord.id, "saved", result.auditLogId));
}
