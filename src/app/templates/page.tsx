import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import {
  contents,
  learningOutcomes,
  learningPieces,
  modules,
  programTemplates,
  rubrics,
  scheduleTemplates,
} from "@/lib/domain";

export default function TemplatesPage() {
  const template = programTemplates[0];

  return (
    <AppShell title="프로그램 템플릿" eyebrow="Program Templates">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="모듈" value={`${modules.length}개`} tone="teal" />
        <Stat label="콘텐츠" value={`${contents.length}개`} />
        <Stat label="학습피스" value={`${learningPieces.length}개`} tone="amber" />
        <Stat label="상대 일정" value={`${scheduleTemplates.length}개`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card title={template.title} subtitle={`템플릿 버전 ${template.version}`}>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-stone-950">복제 가능 객체</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {template.cloneableObjectTypes.map((type) => (
                  <StatusBadge key={type}>{type}</StatusBadge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-stone-950">복제 제외 객체</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {template.excludedObjectTypes.map((type) => (
                  <StatusBadge key={type}>{type}</StatusBadge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card title="템플릿 구성 요약">
          <div className="grid gap-3 text-sm text-stone-700">
            <div className="flex justify-between gap-3 border-b border-stone-100 pb-2">
              <span>루브릭</span>
              <span className="font-medium text-stone-950">{rubrics.length}개</span>
            </div>
            <div className="flex justify-between gap-3 border-b border-stone-100 pb-2">
              <span>학습성과</span>
              <span className="font-medium text-stone-950">{learningOutcomes.length}개</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>참여자/제출물/평가 결과</span>
              <span className="font-medium text-stone-950">복제 제외</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Link
          href="/templates/cohort-preview"
          className="rounded-md border border-teal-700 bg-teal-700 px-3 py-2 text-sm font-medium text-white"
        >
          기수 생성 미리보기
        </Link>
      </div>
    </AppShell>
  );
}
