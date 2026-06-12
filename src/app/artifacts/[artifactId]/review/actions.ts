"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { repositories } from "@/lib/repositories";
import { sessionProvider } from "@/lib/session-provider";

function normalizeText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function buildRedirectPath(artifactId: string, update: string, auditLogId?: string) {
  const params = new URLSearchParams({ update });
  if (auditLogId) params.set("audit", auditLogId);
  return `/artifacts/${artifactId}/review?${params.toString()}`;
}

export async function createArtifactFeedbackAction(formData: FormData) {
  const artifactId = formData.get("artifactId");
  const roleParam = formData.get("role");
  const body = normalizeText(formData.get("body"));

  if (typeof artifactId !== "string" || !body) {
    redirect("/artifacts?update=invalid");
  }

  const artifact = await repositories.artifacts.getArtifactById(artifactId);
  if (!artifact) {
    redirect("/artifacts?update=missing");
  }

  const session = await sessionProvider.requireSession({
    roleParam: typeof roleParam === "string" ? roleParam : undefined,
  });
  const decision = await sessionProvider.canAccess(session, {
    scopeType: artifact.ownerType,
    scopeId: artifact.ownerId,
    action: "create",
  });

  if (!decision.allowed) {
    redirect(buildRedirectPath(artifact.id, "denied"));
  }

  const result = await repositories.artifacts.createFeedback({
    artifactId: artifact.id,
    authorId: session.user.id,
    body,
    targetUserId: artifact.ownerType === "student" ? artifact.ownerId : undefined,
    targetTeamId: artifact.ownerType === "team" ? artifact.ownerId : undefined,
    audit: {
      actorId: session.user.id,
      actorLabel: session.user.name,
      metadata: {
        role: session.activeRole,
        source: session.source,
      },
    },
  });

  revalidatePath(`/artifacts/${artifact.id}/review`);
  revalidatePath(`/artifacts/${artifact.id}`);
  redirect(buildRedirectPath(artifact.id, "created", result.auditLogId));
}
