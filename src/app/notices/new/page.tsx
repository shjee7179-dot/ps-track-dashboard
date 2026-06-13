import { AppShell } from "@/components/app-shell";
import { Card, Stat } from "@/components/ui";
import { createNoticeAction } from "@/app/notices/new/actions";
import { mockRepositories } from "@/lib/mock-repositories";

const updateMessages: Record<string, string> = {
  denied: "현재 역할/scope에서는 공지를 생성할 수 없습니다.",
  invalid: "공지 제목, 내용, 대상 범위를 확인해 주세요.",
};

export default async function NewNoticePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; update?: string }>;
}) {
  const query = await searchParams;
  const cohort = await mockRepositories.cohorts.getActiveCohort();
  const cohortId = cohort?.id ?? "cohort-2026";
  const updateMessage = query.update ? updateMessages[query.update] : undefined;

  return (
    <AppShell title="공지 작성" eyebrow="Communication / New Notice">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="기본 대상" value={cohort?.name ?? cohortId} tone="teal" />
        <Stat label="알림 발송" value="수동" />
        <Stat label="읽음 확인" value="지원" />
      </div>

      {updateMessage ? (
        <div className="mb-4 rounded-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
          {updateMessage}
        </div>
      ) : null}

      <Card title="공지 작성 폼" subtitle="대상 범위와 본문을 저장">
        <form action={createNoticeAction} className="grid gap-4">
          <input type="hidden" name="role" value={query.role ?? "operator"} />
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-stone-700">대상 범위</span>
            <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
              <select
                name="targetScopeType"
                defaultValue="cohort"
                className="h-10 rounded-md border border-stone-200 bg-white px-3 text-stone-700"
              >
                <option value="cohort">cohort</option>
                <option value="program">program</option>
                <option value="track">track</option>
                <option value="team">team</option>
                <option value="student">student</option>
              </select>
              <input
                name="targetScopeId"
                defaultValue={cohortId}
                className="h-10 rounded-md border border-stone-200 bg-white px-3 text-stone-700"
              />
            </div>
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-stone-700">제목</span>
            <input
              name="title"
              required
              placeholder="예: 8월 중간 산출물 제출 안내"
              className="h-10 rounded-md border border-stone-200 bg-white px-3 text-stone-700"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-stone-700">내용</span>
            <textarea
              name="body"
              required
              rows={8}
              placeholder="공지 내용을 입력합니다."
              className="rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-700"
            />
          </label>
          <button
            type="submit"
            className="h-10 rounded-md border border-teal-700 bg-teal-700 px-3 text-sm font-medium text-white"
          >
            공지 저장
          </button>
        </form>
      </Card>
    </AppShell>
  );
}
