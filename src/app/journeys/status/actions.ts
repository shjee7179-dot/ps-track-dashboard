"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mockRepositories } from "@/lib/mock-repositories";
import { mockSessionProvider } from "@/lib/session";
import type { LearningPieceStatus } from "@/lib/domain";

const allowedStatuses: LearningPieceStatus[] = [
  "locked",
  "not_started",
  "in_progress",
  "needs_submission",
  "pending_review",
  "revising",
  "pending_evaluation",
  "completed",
  "delayed",
];

function isLearningPieceStatus(value: FormDataEntryValue | null): value is LearningPieceStatus {
  return typeof value === "string" && allowedStatuses.includes(value as LearningPieceStatus);
}

export async function updateLearningPieceStatusAction(formData: FormData) {
  const statusId = formData.get("statusId");
  const nextStatus = formData.get("nextStatus");
  const roleParam = formData.get("role");

  if (typeof statusId !== "string" || !isLearningPieceStatus(nextStatus)) {
    redirect("/journeys/status?update=invalid");
  }

  const statuses = await mockRepositories.learning.listStudentLearningPieceStatuses();
  const currentStatus = statuses.find((status) => status.id === statusId);
  if (!currentStatus) {
    redirect("/journeys/status?update=missing");
  }

  const session = await mockSessionProvider.requireSession({
    roleParam: typeof roleParam === "string" ? roleParam : undefined,
  });
  const decision = await mockSessionProvider.canAccess(session, {
    scopeType: "student",
    scopeId: currentStatus.studentId,
    action: "update",
  });

  if (!decision.allowed) {
    redirect("/journeys/status?update=denied");
  }

  const result = await mockRepositories.learning.updateStudentLearningPieceStatus(
    statusId,
    nextStatus,
  );

  revalidatePath("/journeys/status");
  redirect(`/journeys/status?update=accepted&audit=${result.auditLogId ?? "mock"}`);
}
