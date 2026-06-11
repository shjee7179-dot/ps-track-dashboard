"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { repositories } from "@/lib/repositories";
import { sessionProvider } from "@/lib/session-provider";
import { getLmsReadonlyViewAdapter } from "@/lib/lms/readonly-adapter";
import type {
  LmsContentGroup,
  LmsContentMappingActivationRule,
  LmsContentMappingStatus,
  LmsContentType,
} from "@/lib/lms/contracts";

const contentGroups: LmsContentGroup[] = ["regular", "subscription", "community"];
const contentTypes: LmsContentType[] = [
  "offline",
  "realtime",
  "hyflex",
  "online",
  "knowledge",
  "ebook",
  "learning_group",
  "seminar",
];
const activationRules: LmsContentMappingActivationRule[] = [
  "record_exists",
  "participation_active",
  "completion_completed",
];
const mappingStatuses: LmsContentMappingStatus[] = ["draft", "active", "inactive"];

function normalizeText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function normalizeOptionalText(value: FormDataEntryValue | null) {
  return normalizeText(value);
}

function isContentGroup(value: FormDataEntryValue | null): value is LmsContentGroup {
  return typeof value === "string" && contentGroups.includes(value as LmsContentGroup);
}

function isContentType(value: FormDataEntryValue | null): value is LmsContentType {
  return typeof value === "string" && contentTypes.includes(value as LmsContentType);
}

function isActivationRule(
  value: FormDataEntryValue | null,
): value is LmsContentMappingActivationRule {
  return typeof value === "string" && activationRules.includes(value as LmsContentMappingActivationRule);
}

function isMappingStatus(value: FormDataEntryValue | null): value is LmsContentMappingStatus {
  return typeof value === "string" && mappingStatuses.includes(value as LmsContentMappingStatus);
}

function buildRedirectPath(update: string, mappingId?: string) {
  const params = new URLSearchParams({ update });
  if (mappingId) params.set("mapping", mappingId);
  return `/admin/lms-content-mappings?${params.toString()}`;
}

function buildCatalogTargetKey(lmsContentId: string, lmsCourseRoundId?: string) {
  return `${lmsContentId}::${lmsCourseRoundId ?? ""}`;
}

export async function createLmsContentMappingAction(formData: FormData) {
  const cohortId = normalizeText(formData.get("cohortId"));
  const moduleId = normalizeText(formData.get("moduleId"));
  const contentId = normalizeText(formData.get("contentId"));
  const learningPieceId = normalizeText(formData.get("learningPieceId"));
  let lmsContentId = normalizeText(formData.get("lmsContentId"));
  let lmsCourseRoundId = normalizeOptionalText(formData.get("lmsCourseRoundId"));
  let contentGroup = formData.get("contentGroup");
  let contentType = formData.get("contentType");
  const activationRule = formData.get("activationRule");
  const status = formData.get("status");
  const required = formData.get("required") === "on";
  const roleParam = formData.get("role");
  const lmsCatalogTarget = normalizeOptionalText(formData.get("lmsCatalogTarget"));

  if (lmsCatalogTarget) {
    const catalog = await getLmsReadonlyViewAdapter().listContentCatalog();
    const selected = catalog.find(
      (record) => buildCatalogTargetKey(record.lmsContentId, record.lmsCourseRoundId) === lmsCatalogTarget,
    );

    if (!selected) {
      redirect(buildRedirectPath("invalid"));
    }

    lmsContentId = selected.lmsContentId;
    lmsCourseRoundId = selected.lmsCourseRoundId;
    contentGroup = selected.contentGroup;
    contentType = selected.contentType;
  }

  if (
    !cohortId ||
    !moduleId ||
    !contentId ||
    !learningPieceId ||
    !lmsContentId ||
    !isContentGroup(contentGroup) ||
    !isContentType(contentType) ||
    !isActivationRule(activationRule) ||
    !isMappingStatus(status)
  ) {
    redirect(buildRedirectPath("invalid"));
  }

  const session = await sessionProvider.requireSession({
    roleParam: typeof roleParam === "string" ? roleParam : undefined,
  });
  const decision = await sessionProvider.canAccess(session, {
    scopeType: "cohort",
    scopeId: cohortId,
    action: "create",
  });

  if (!decision.allowed) {
    redirect(buildRedirectPath("denied"));
  }

  try {
    const mapping = await repositories.lms.contentMappings.createMapping({
      cohortId,
      moduleId,
      contentId,
      learningPieceId,
      lmsContentId,
      lmsCourseRoundId,
      contentGroup,
      contentType,
      required,
      activationRule,
      status,
      createdBy: session.user.id,
    });

    revalidatePath("/admin/lms-content-mappings");
    redirect(buildRedirectPath("created", mapping.id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("duplicate") || message.includes("unique")) {
      redirect(buildRedirectPath("duplicate"));
    }
    throw error;
  }
}

export async function updateLmsContentMappingStatusAction(formData: FormData) {
  const mappingId = normalizeText(formData.get("mappingId"));
  const status = formData.get("status");
  const roleParam = formData.get("role");

  if (!mappingId || !isMappingStatus(status)) {
    redirect(buildRedirectPath("invalid"));
  }

  const mapping = await repositories.lms.contentMappings.getMappingById(mappingId);
  if (!mapping) {
    redirect(buildRedirectPath("missing", mappingId));
  }

  const session = await sessionProvider.requireSession({
    roleParam: typeof roleParam === "string" ? roleParam : undefined,
  });
  const decision = await sessionProvider.canAccess(session, {
    scopeType: "cohort",
    scopeId: mapping.cohortId,
    action: "update",
  });

  if (!decision.allowed) {
    redirect(buildRedirectPath("denied", mapping.id));
  }

  const updated = await repositories.lms.contentMappings.updateMappingStatus({
    mappingId: mapping.id,
    status,
  });

  if (!updated) {
    redirect(buildRedirectPath("missing", mapping.id));
  }

  revalidatePath("/admin/lms-content-mappings");
  redirect(buildRedirectPath("status-updated", updated.id));
}
