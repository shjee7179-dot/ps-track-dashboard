import "server-only";

import { getLmsReadonlyViewAdapter } from "@/lib/lms/readonly-adapter";
import { repositories } from "@/lib/repositories";
import type {
  LmsCompletionBucket,
  LmsContentGroup,
  LmsContentType,
  LmsLearningRecord,
} from "@/lib/lms/contracts";
import type { StudentJourneyItem } from "@/lib/repository-contracts";

export type LmsLearningRecordOverlay = {
  learningPieceId: string;
  lmsRecordId: string;
  lmsContentId: string;
  lmsCourseRoundId?: string;
  contentGroup: LmsContentGroup;
  contentType: LmsContentType;
  contentTitle: string;
  completionBucket?: LmsCompletionBucket;
  completionStatusLabel?: string;
  participationStatusLabel?: string;
  progressRate?: number;
  score?: number;
  learningTimeMinutes?: number;
  completedAt?: string;
  updatedAt?: string;
};

export type StudentJourneyItemWithLms = StudentJourneyItem & {
  lmsRecord?: LmsLearningRecordOverlay;
};

export type StudentJourneyLmsSummary = {
  mappedRecords: number;
  completedRecords: number;
  notCompletedRecords: number;
  completionReadyButNotSynced: number;
};

function lmsRecordKey(input: { lmsContentId: string; lmsCourseRoundId?: string }) {
  return `${input.lmsContentId}::${input.lmsCourseRoundId ?? ""}`;
}

function toOverlay(learningPieceId: string, record: LmsLearningRecord): LmsLearningRecordOverlay {
  return {
    learningPieceId,
    lmsRecordId: record.lmsRecordId,
    lmsContentId: record.lmsContentId,
    lmsCourseRoundId: record.lmsCourseRoundId,
    contentGroup: record.contentGroup,
    contentType: record.contentType,
    contentTitle: record.contentTitle,
    completionBucket: record.completionBucket,
    completionStatusLabel: record.completionStatusLabel,
    participationStatusLabel: record.participationStatusLabel,
    progressRate: record.progressRate,
    score: record.score,
    learningTimeMinutes: record.learningTimeMinutes,
    completedAt: record.completedAt,
    updatedAt: record.updatedAt,
  };
}

export async function getJourneyLmsRecordMap(
  studentId: string,
): Promise<Map<string, LmsLearningRecordOverlay>> {
  const [student, cohort] = await Promise.all([
    repositories.users.getUserById(studentId),
    repositories.cohorts.getActiveCohort(),
  ]);

  if (!student || !cohort) {
    return new Map();
  }

  const [mappings, learningRecords] = await Promise.all([
    repositories.lms.contentMappings.listMappings({
      cohortId: cohort.id,
      status: "active",
    }),
    getLmsReadonlyViewAdapter().listLearningRecordsByUser({
      keycloakSubject: student.externalSubject,
    }),
  ]);

  const recordsByLmsKey = new Map(
    learningRecords.map((record) => [lmsRecordKey(record), record]),
  );
  const overlays = new Map<string, LmsLearningRecordOverlay>();

  for (const mapping of mappings) {
    const record = recordsByLmsKey.get(lmsRecordKey(mapping));
    if (record) {
      overlays.set(mapping.learningPieceId, toOverlay(mapping.learningPieceId, record));
    }
  }

  return overlays;
}

export async function attachLmsRecordsToJourney(
  studentId: string,
  items: StudentJourneyItem[],
): Promise<StudentJourneyItemWithLms[]> {
  const overlays = await getJourneyLmsRecordMap(studentId);

  return items.map((item) => ({
    ...item,
    lmsRecord: overlays.get(item.learningPiece.id),
  }));
}

export async function getStudentJourneyLmsSummary(
  studentId: string,
  items: StudentJourneyItem[],
): Promise<StudentJourneyLmsSummary> {
  const journey = await attachLmsRecordsToJourney(studentId, items);
  const lmsItems = journey.filter((item) => item.lmsRecord);
  const completedItems = lmsItems.filter(
    (item) => item.lmsRecord?.completionBucket === "completed",
  );

  return {
    mappedRecords: lmsItems.length,
    completedRecords: completedItems.length,
    notCompletedRecords: lmsItems.filter(
      (item) => item.lmsRecord?.completionBucket === "not_completed",
    ).length,
    completionReadyButNotSynced: completedItems.filter(
      (item) => item.status.status !== "completed",
    ).length,
  };
}
