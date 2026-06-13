export type LmsProviderName = "none" | "mock-view";

export type LmsContentGroup = "regular" | "subscription" | "community";

export type LmsContentType =
  | "offline"
  | "realtime"
  | "hyflex"
  | "online"
  | "knowledge"
  | "ebook"
  | "learning_group"
  | "seminar";

export type LmsCompletionBucket = "completed" | "not_completed";

export type LmsContentCatalogRecord = {
  lmsContentId: string;
  lmsCourseRoundId?: string;
  contentGroup: LmsContentGroup;
  contentType: LmsContentType;
  contentTitle: string;
  courseRoundTitle?: string;
  providerOrg?: string;
  openStatusCode?: string;
  openStatusLabel?: string;
  applyStartsAt?: string;
  applyEndsAt?: string;
  learningStartsAt?: string;
  learningEndsAt?: string;
  updatedAt?: string;
};

export type LmsLearningRecord = {
  lmsRecordId: string;
  lmsUserId: string;
  keycloakSubject?: string;
  userName?: string;
  userEmail?: string;
  userPhoneMasked?: string;
  lmsContentId: string;
  lmsCourseRoundId?: string;
  contentGroup: LmsContentGroup;
  contentType: LmsContentType;
  contentTitle: string;
  courseRoundTitle?: string;
  participationStatusCode?: string;
  participationStatusLabel?: string;
  completionStatusCode?: string;
  completionStatusLabel?: string;
  completionBucket?: LmsCompletionBucket;
  progressRate?: number;
  score?: number;
  learningTimeMinutes?: number;
  startedAt?: string;
  completedAt?: string;
  updatedAt?: string;
};

export type LmsContentMappingActivationRule =
  | "record_exists"
  | "participation_active"
  | "completion_completed";

export type LmsContentMappingStatus = "draft" | "active" | "inactive";

export type LmsContentMappingDraft = {
  cohortId: string;
  moduleId: string;
  contentId: string;
  learningPieceId: string;
  lmsContentId: string;
  lmsCourseRoundId?: string;
  contentGroup: LmsContentGroup;
  contentType: LmsContentType;
  required: boolean;
  activationRule: LmsContentMappingActivationRule;
  status: LmsContentMappingStatus;
};

export type LmsContentMapping = LmsContentMappingDraft & {
  id: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type LmsAuditContext = {
  actorId: string;
  actorLabel: string;
  metadata?: Record<string, unknown>;
};

export type LmsMutationResult<T> = {
  data: T;
  auditLogId?: string;
};

export type LmsContentMappingQuery = {
  cohortId?: string;
  learningPieceId?: string;
  lmsContentId?: string;
  status?: LmsContentMappingStatus;
  limit?: number;
};

export type LmsContentMappingRepository = {
  listMappings(query?: LmsContentMappingQuery): Promise<LmsContentMapping[]>;
  getMappingById(mappingId: string): Promise<LmsContentMapping | undefined>;
  getMappingByLearningPiece(input: {
    cohortId: string;
    learningPieceId: string;
  }): Promise<LmsContentMapping | undefined>;
  createMapping(input: LmsContentMappingDraft & {
    createdBy?: string;
    audit?: LmsAuditContext;
  }): Promise<LmsMutationResult<LmsContentMapping>>;
  updateMappingStatus(input: {
    mappingId: string;
    status: LmsContentMappingStatus;
    audit?: LmsAuditContext;
  }): Promise<LmsMutationResult<LmsContentMapping> | undefined>;
};

export type LmsReadonlyViewAdapter = {
  listContentCatalog(): Promise<LmsContentCatalogRecord[]>;
  listLearningRecordsByUser(input: {
    lmsUserId?: string;
    keycloakSubject?: string;
  }): Promise<LmsLearningRecord[]>;
};

export type LmsReadonlySourceTableName =
  | "회원"
  | "회원소속"
  | "등록"
  | "등록_통계"
  | "수강_통계"
  | "과목"
  | "시퀀스"
  | "시퀀스_모듈"
  | "시퀀스_수업"
  | "콘텐츠_풀"
  | "채널_콘텐츠"
  | "채널_학습"
  | "전자책_콘텐츠"
  | "전자책_학습"
  | "학습_랩"
  | "학습_랩_회원";
