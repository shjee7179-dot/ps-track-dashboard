"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mockRepositories } from "@/lib/mock-repositories";
import { mockSessionProvider } from "@/lib/session";

function normalizeText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function buildRedirectPath(artifactId: string, update: string, auditLogId?: string) {
  const params = new URLSearchParams({ update });
  if (auditLogId) params.set("audit", auditLogId);
  return `/artifacts/${artifactId}/evaluation?${params.toString()}`;
}

export async function submitArtifactEvaluationAction(formData: FormData) {
  const artifactId = formData.get("artifactId");
  const rubricId = formData.get("rubricId");
  const roleParam = formData.get("role");
  const overallComment = normalizeText(formData.get("overallComment"));

  if (typeof artifactId !== "string" || typeof rubricId !== "string" || !overallComment) {
    redirect("/artifacts?update=invalid");
  }

  const artifact = await mockRepositories.artifacts.getArtifactById(artifactId);
  if (!artifact) {
    redirect("/artifacts?update=missing");
  }

  const rubricItems = await mockRepositories.evaluations.listRubricItems(rubricId);
  if (!rubricItems.length) {
    redirect(buildRedirectPath(artifact.id, "missing-rubric"));
  }

  const itemScores = rubricItems.map((item) => {
    const scoreValue = normalizeText(formData.get(`score:${item.id}`));
    const comment = normalizeText(formData.get(`comment:${item.id}`));
    const score = scoreValue ? Number(scoreValue) : Number.NaN;
    return {
      rubricItemId: item.id,
      score,
      comment: comment ?? "",
      maxScore: item.maxScore,
    };
  });
  const invalidScore = itemScores.some(
    (item) => !Number.isFinite(item.score) || item.score < 0 || item.score > item.maxScore,
  );
  if (invalidScore) {
    redirect(buildRedirectPath(artifact.id, "invalid"));
  }

  const session = await mockSessionProvider.requireSession({
    roleParam: typeof roleParam === "string" ? roleParam : undefined,
  });
  const decision = await mockSessionProvider.canAccess(session, {
    scopeType: artifact.ownerType,
    scopeId: artifact.ownerId,
    action: "create",
  });

  if (!decision.allowed) {
    redirect(buildRedirectPath(artifact.id, "denied"));
  }

  const result = await mockRepositories.evaluations.createEvaluation({
    artifactId: artifact.id,
    rubricId,
    evaluatorId: session.user.id,
    overallComment,
    itemScores: itemScores.map((item) => ({
      rubricItemId: item.rubricItemId,
      score: item.score,
      comment: item.comment,
    })),
  });

  revalidatePath(`/artifacts/${artifact.id}/evaluation`);
  revalidatePath(`/artifacts/${artifact.id}`);
  revalidatePath("/outcomes");
  redirect(buildRedirectPath(artifact.id, "submitted", result.auditLogId ?? "mock"));
}
