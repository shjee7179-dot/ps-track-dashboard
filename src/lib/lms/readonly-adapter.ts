import "server-only";

import type {
  LmsContentCatalogRecord,
  LmsLearningRecord,
  LmsProviderName,
  LmsReadonlyViewAdapter,
} from "@/lib/lms/contracts";
import { syntheticLmsIds } from "@/lib/lms/source-table-contract";

export function getLmsProviderName(value = process.env.LMS_PROVIDER): LmsProviderName {
  if (!value || value === "none") {
    return "none";
  }
  if (value === "mock-view") {
    return "mock-view";
  }

  throw new Error(`Unsupported LMS_PROVIDER value: ${value}`);
}

const syntheticUpdatedAt = "2026-07-01T00:00:00.000Z";

export const mockLmsContentCatalog: LmsContentCatalogRecord[] = [
  {
    lmsContentId: syntheticLmsIds.contentPoolId,
    lmsCourseRoundId: syntheticLmsIds.regularCourseRoundId,
    contentGroup: "regular",
    contentType: "online",
    contentTitle: "미래 의사과학자 연구 질문 만들기",
    courseRoundTitle: "2026 미래 의사과학자 챌린지 트랙 1차",
    providerOrg: "KIRD AlphaCampus",
    openStatusCode: "OPEN",
    openStatusLabel: "운영중",
    learningStartsAt: "2026-07-01",
    learningEndsAt: "2026-10-31",
    updatedAt: syntheticUpdatedAt,
  },
  {
    lmsContentId: syntheticLmsIds.channelContentId,
    contentGroup: "subscription",
    contentType: "knowledge",
    contentTitle: "의사과학자 진로 탐색 지식 콘텐츠",
    providerOrg: "KIRD AlphaCampus",
    openStatusCode: "OPEN",
    openStatusLabel: "노출중",
    updatedAt: syntheticUpdatedAt,
  },
  {
    lmsContentId: syntheticLmsIds.ebookContentId,
    contentGroup: "subscription",
    contentType: "ebook",
    contentTitle: "바이오메디컬 연구 입문 전자책",
    providerOrg: "KIRD AlphaCampus",
    openStatusCode: "N",
    openStatusLabel: "사용",
    updatedAt: syntheticUpdatedAt,
  },
  {
    lmsContentId: syntheticLmsIds.learningLabId,
    contentGroup: "community",
    contentType: "learning_group",
    contentTitle: "미래 의사과학자 연구 관심사 학습모임",
    providerOrg: "KIRD AlphaCampus",
    openStatusCode: "2",
    openStatusLabel: "승인",
    learningStartsAt: "2026-07-01",
    learningEndsAt: "2026-10-31",
    updatedAt: syntheticUpdatedAt,
  },
];

export const mockLmsLearningRecords: LmsLearningRecord[] = [
  {
    lmsRecordId: syntheticLmsIds.regularEnrollmentId,
    lmsUserId: syntheticLmsIds.userId,
    keycloakSubject: syntheticLmsIds.keycloakSubject,
    userName: "Synthetic Student",
    userEmail: "synthetic.student@example.test",
    userPhoneMasked: "010-****-0001",
    lmsContentId: syntheticLmsIds.contentPoolId,
    lmsCourseRoundId: syntheticLmsIds.regularCourseRoundId,
    contentGroup: "regular",
    contentType: "online",
    contentTitle: "미래 의사과학자 연구 질문 만들기",
    courseRoundTitle: "2026 미래 의사과학자 챌린지 트랙 1차",
    participationStatusCode: "APPROVED",
    participationStatusLabel: "승인",
    completionStatusCode: "COMPLETED",
    completionStatusLabel: "수료",
    completionBucket: "completed",
    progressRate: 100,
    score: 95,
    learningTimeMinutes: 120,
    startedAt: "2026-07-01",
    completedAt: "2026-07-15",
    updatedAt: syntheticUpdatedAt,
  },
  {
    lmsRecordId: syntheticLmsIds.channelLearningId,
    lmsUserId: syntheticLmsIds.userId,
    keycloakSubject: syntheticLmsIds.keycloakSubject,
    userName: "Synthetic Student",
    userEmail: "synthetic.student@example.test",
    userPhoneMasked: "010-****-0001",
    lmsContentId: syntheticLmsIds.channelContentId,
    contentGroup: "subscription",
    contentType: "knowledge",
    contentTitle: "의사과학자 진로 탐색 지식 콘텐츠",
    completionStatusCode: "Y",
    completionStatusLabel: "완료",
    completionBucket: "completed",
    progressRate: 100,
    learningTimeMinutes: 30,
    completedAt: "2026-07-20",
    updatedAt: syntheticUpdatedAt,
  },
  {
    lmsRecordId: syntheticLmsIds.ebookLearningId,
    lmsUserId: syntheticLmsIds.userId,
    keycloakSubject: syntheticLmsIds.keycloakSubject,
    userName: "Synthetic Student",
    userEmail: "synthetic.student@example.test",
    userPhoneMasked: "010-****-0001",
    lmsContentId: syntheticLmsIds.ebookContentId,
    contentGroup: "subscription",
    contentType: "ebook",
    contentTitle: "바이오메디컬 연구 입문 전자책",
    completionStatusCode: "P",
    completionStatusLabel: "학습중",
    completionBucket: "not_completed",
    progressRate: 45,
    learningTimeMinutes: 40,
    startedAt: "2026-08-01",
    updatedAt: syntheticUpdatedAt,
  },
  {
    lmsRecordId: syntheticLmsIds.learningLabMemberId,
    lmsUserId: syntheticLmsIds.userId,
    keycloakSubject: syntheticLmsIds.keycloakSubject,
    userName: "Synthetic Student",
    userEmail: "synthetic.student@example.test",
    userPhoneMasked: "010-****-0001",
    lmsContentId: syntheticLmsIds.learningLabId,
    contentGroup: "community",
    contentType: "learning_group",
    contentTitle: "미래 의사과학자 연구 관심사 학습모임",
    participationStatusCode: "JOINED",
    participationStatusLabel: "참여",
    completionStatusCode: "N",
    completionStatusLabel: "미완료",
    completionBucket: "not_completed",
    learningTimeMinutes: 60,
    startedAt: "2026-08-10",
    updatedAt: syntheticUpdatedAt,
  },
];

export const noneLmsReadonlyViewAdapter: LmsReadonlyViewAdapter = {
  async listContentCatalog() {
    return [];
  },
  async listLearningRecordsByUser() {
    return [];
  },
};

export const mockLmsReadonlyViewAdapter: LmsReadonlyViewAdapter = {
  async listContentCatalog() {
    return mockLmsContentCatalog;
  },
  async listLearningRecordsByUser(input) {
    return mockLmsLearningRecords.filter((record) => {
      if (input.lmsUserId && record.lmsUserId !== input.lmsUserId) {
        return false;
      }
      if (input.keycloakSubject && record.keycloakSubject !== input.keycloakSubject) {
        return false;
      }
      return Boolean(input.lmsUserId || input.keycloakSubject);
    });
  },
};

export function getLmsReadonlyViewAdapter(): LmsReadonlyViewAdapter {
  const providerName = getLmsProviderName();
  if (providerName === "mock-view") {
    return mockLmsReadonlyViewAdapter;
  }
  return noneLmsReadonlyViewAdapter;
}
