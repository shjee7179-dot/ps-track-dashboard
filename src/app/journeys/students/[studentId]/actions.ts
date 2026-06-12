"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getJourneyLmsRecordMap } from "@/lib/lms/journey-overlay";
import { repositories } from "@/lib/repositories";
import { sessionProvider } from "@/lib/session-provider";

function redirectToStudentJourney(
  studentId: string,
  result: string,
  role?: string,
  auditLogId?: string,
): never {
  const roleQuery = role ? `role=${role}&` : "";
  const auditQuery = auditLogId ? `&audit=${auditLogId}` : "";
  redirect(`/journeys/students/${studentId}?${roleQuery}lmsSync=${result}${auditQuery}`);
}

export async function applyLmsCompletionToLearningPieceStatusAction(formData: FormData) {
  const studentId = formData.get("studentId");
  const statusId = formData.get("statusId");
  const learningPieceId = formData.get("learningPieceId");
  const roleParam = formData.get("role");
  const role = typeof roleParam === "string" ? roleParam : undefined;

  if (
    typeof studentId !== "string" ||
    typeof statusId !== "string" ||
    typeof learningPieceId !== "string"
  ) {
    redirect("/journeys/students?lmsSync=invalid");
  }

  const statuses = await repositories.learning.listStudentLearningPieceStatuses({ studentId });
  const currentStatus = statuses.find(
    (status) => status.id === statusId && status.learningPieceId === learningPieceId,
  );
  if (!currentStatus) {
    redirectToStudentJourney(studentId, "missing", role);
  }

  const session = await sessionProvider.requireSession({
    roleParam: role,
  });
  const decision = await sessionProvider.canAccess(session, {
    scopeType: "student",
    scopeId: studentId,
    action: "update",
  });
  if (!decision.allowed) {
    redirectToStudentJourney(studentId, "denied", role);
  }

  const lmsRecordMap = await getJourneyLmsRecordMap(studentId);
  const lmsRecord = lmsRecordMap.get(learningPieceId);
  if (lmsRecord?.completionBucket !== "completed") {
    redirectToStudentJourney(studentId, "not-ready", role);
  }

  if (currentStatus.status === "completed") {
    redirectToStudentJourney(studentId, "already-completed", role);
  }

  const result = await repositories.learning.updateStudentLearningPieceStatus(
    statusId,
    "completed",
    {
      actorId: session.user.id,
      actorLabel: session.user.name,
      metadata: {
        role: session.activeRole,
        source: session.source,
        reason: "lms_completion_apply",
      },
    },
  );

  revalidatePath("/journeys/students");
  revalidatePath(`/journeys/students/${studentId}`);
  revalidatePath(`/objects/learning-pieces/${learningPieceId}`);
  redirectToStudentJourney(studentId, "accepted", role, result.auditLogId);
}
