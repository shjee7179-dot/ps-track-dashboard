import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import {
  cohort2026,
  getScheduleTemplatePreview,
  programTemplates,
  scheduleTemplates,
} from "@/lib/domain";

const nextCohortStart = "2027-07-01";

const objectTypeLabels = {
  module: "모듈",
  content: "콘텐츠",
  learning_piece: "학습피스",
  survey: "설문",
};

export default function CohortPreviewPage() {
  const template = programTemplates[0];
  const preview = getScheduleTemplatePreview(template.id, nextCohortStart);

  return (
    <AppShell title="기수 생성 미리보기" eyebrow="Template Clone Preview">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="기준 템플릿" value={template.version} tone="teal" />
        <Stat label="새 기수 시작일" value={nextCohortStart} />
        <Stat label="상대 일정" value={`${scheduleTemplates.length}개`} tone="amber" />
        <Stat label="원본 기수" value={cohort2026.name} />
      </div>

      <Card title="상대 일정 계산 결과" subtitle="실제 날짜 대신 시작일 기준 day offset으로 재사용">
        <div className="space-y-3">
          {preview.map((item) => (
            <div key={item.id} className="rounded-lg border border-stone-200 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-stone-950">{item.objectTitle}</p>
                  <p className="mt-1 text-sm text-stone-600">
                    D+{item.relativeStartDay} 시작 / D+{item.relativeDueDay} 마감
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <StatusBadge>{objectTypeLabels[item.objectType]}</StatusBadge>
                  <StatusBadge>{item.plannedStartAt}</StatusBadge>
                  <StatusBadge>{item.plannedDueAt}</StatusBadge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6">
        <Link
          href="/templates"
          className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700"
        >
          템플릿으로
        </Link>
      </div>
    </AppShell>
  );
}
