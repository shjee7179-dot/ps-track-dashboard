import { AppShell } from "@/components/app-shell";
import { Card, Stat } from "@/components/ui";
import { cohort2026 } from "@/lib/domain";

export default function NewNoticePage() {
  return (
    <AppShell title="공지 작성" eyebrow="Communication / New Notice">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="기본 대상" value={cohort2026.name} tone="teal" />
        <Stat label="알림 발송" value="수동" />
        <Stat label="읽음 확인" value="지원" />
      </div>
      <Card title="공지 작성 폼" subtitle="Sprint 3 mock form, 저장 동작은 이후 persistence에서 연결">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-stone-700">대상 범위</span>
            <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-600">
              cohort / {cohort2026.id}
            </div>
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-stone-700">제목</span>
            <div className="rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-400">
              예: 8월 중간 산출물 제출 안내
            </div>
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-stone-700">내용</span>
            <div className="min-h-32 rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-400">
              공지 내용을 입력합니다.
            </div>
          </label>
        </div>
      </Card>
    </AppShell>
  );
}
