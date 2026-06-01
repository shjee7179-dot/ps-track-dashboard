"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mockRepositories } from "@/lib/mock-repositories";
import { mockSessionProvider } from "@/lib/session";
import type { ReminderCandidate, RiskSignal } from "@/lib/types";

const riskStatuses: RiskSignal["actionStatus"][] = ["open", "in_progress", "resolved"];
const reminderStatuses: ReminderCandidate["sendStatus"][] = ["pending", "sent", "skipped"];

function isRiskStatus(value: FormDataEntryValue | null): value is RiskSignal["actionStatus"] {
  return typeof value === "string" && riskStatuses.includes(value as RiskSignal["actionStatus"]);
}

function isReminderStatus(value: FormDataEntryValue | null): value is ReminderCandidate["sendStatus"] {
  return typeof value === "string" && reminderStatuses.includes(value as ReminderCandidate["sendStatus"]);
}

function buildRedirectPath(update: string, auditLogId?: string) {
  const params = new URLSearchParams({ update });
  if (auditLogId) params.set("audit", auditLogId);
  return `/operations/risks?${params.toString()}`;
}

export async function updateRiskStatusAction(formData: FormData) {
  const riskSignalId = formData.get("riskSignalId");
  const nextStatus = formData.get("nextStatus");
  const roleParam = formData.get("role");

  if (typeof riskSignalId !== "string" || !isRiskStatus(nextStatus)) {
    redirect(buildRedirectPath("invalid"));
  }

  const risks = await mockRepositories.operations.listRiskSignals();
  const risk = risks.find((item) => item.id === riskSignalId);
  if (!risk) {
    redirect(buildRedirectPath("missing"));
  }

  const session = await mockSessionProvider.requireSession({
    roleParam: typeof roleParam === "string" ? roleParam : undefined,
  });
  const decision = await mockSessionProvider.canAccess(session, {
    scopeType: risk.targetType,
    scopeId: risk.targetId,
    action: "update",
  });

  if (!decision.allowed) {
    redirect(buildRedirectPath("denied"));
  }

  const result = await mockRepositories.operations.updateRiskSignalStatus(risk.id, nextStatus);
  revalidatePath("/operations/risks");
  redirect(buildRedirectPath("risk-saved", result.auditLogId ?? "mock"));
}

export async function updateReminderStatusAction(formData: FormData) {
  const reminderId = formData.get("reminderId");
  const nextStatus = formData.get("nextStatus");
  const roleParam = formData.get("role");

  if (typeof reminderId !== "string" || !isReminderStatus(nextStatus)) {
    redirect(buildRedirectPath("invalid"));
  }

  const reminders = await mockRepositories.operations.listReminderCandidates();
  const reminder = reminders.find((item) => item.id === reminderId);
  if (!reminder) {
    redirect(buildRedirectPath("missing"));
  }

  const session = await mockSessionProvider.requireSession({
    roleParam: typeof roleParam === "string" ? roleParam : undefined,
  });
  const decision = await mockSessionProvider.canAccess(session, {
    scopeType: reminder.targetType,
    scopeId: reminder.targetId,
    action: "update",
  });

  if (!decision.allowed) {
    redirect(buildRedirectPath("denied"));
  }

  const result = await mockRepositories.operations.updateReminderSendStatus(
    reminder.id,
    nextStatus,
  );
  revalidatePath("/operations/risks");
  redirect(buildRedirectPath("reminder-saved", result.auditLogId ?? "mock"));
}
