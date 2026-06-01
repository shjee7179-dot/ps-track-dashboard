"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mockRepositories } from "@/lib/mock-repositories";
import { mockSessionProvider } from "@/lib/session";

function normalizeOptionalText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function buildRedirectPath(artifactId: string, update: string, auditLogId?: string) {
  const params = new URLSearchParams({ update });
  if (auditLogId) params.set("audit", auditLogId);
  return `/artifacts/${artifactId}?${params.toString()}`;
}

export async function createArtifactSubmissionAction(formData: FormData) {
  const artifactId = formData.get("artifactId");
  const roleParam = formData.get("role");
  const note = normalizeOptionalText(formData.get("note"));
  const externalUrl = normalizeOptionalText(formData.get("externalUrl"));
  const fileName = normalizeOptionalText(formData.get("fileName"));

  if (typeof artifactId !== "string" || !note) {
    redirect("/artifacts?update=invalid");
  }

  const artifact = await mockRepositories.artifacts.getArtifactById(artifactId);
  if (!artifact) {
    redirect("/artifacts?update=missing");
  }

  if (!externalUrl && !fileName) {
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

  const result = await mockRepositories.artifacts.createSubmission({
    artifactId: artifact.id,
    submittedBy: session.user.id,
    externalUrl,
    fileName,
    note,
  });

  revalidatePath(`/artifacts/${artifact.id}`);
  revalidatePath("/artifacts");
  redirect(buildRedirectPath(artifact.id, "submitted", result.auditLogId ?? "mock"));
}
