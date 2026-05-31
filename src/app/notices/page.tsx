import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { getUserById, notices } from "@/lib/domain";

export default function NoticesPage() {
  return (
    <AppShell title="공지사항" eyebrow="Communication / Notices">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="공지" value={`${notices.length}건`} tone="teal" />
        <Stat label="읽음 합계" value={`${notices.reduce((sum, notice) => sum + notice.readCount, 0)}회`} />
        <Stat label="작성 방식" value="수동 작성" />
      </div>
      <div className="mb-4 flex justify-end">
        <Link href="/notices/new" className="rounded-md border border-teal-700 bg-teal-700 px-3 py-2 text-sm font-medium text-white">
          공지 작성
        </Link>
      </div>
      <Card title="공지 목록">
        <div className="space-y-3">
          {notices.map((notice) => (
            <div key={notice.id} className="rounded-lg border border-stone-200 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-stone-950">{notice.title}</p>
                  <p className="mt-1 text-sm text-stone-600">{notice.body}</p>
                </div>
                <StatusBadge>{notice.targetScopeType}</StatusBadge>
              </div>
              <p className="mt-3 text-xs text-stone-500">
                {getUserById(notice.createdBy)?.name} / {notice.publishedAt} / 읽음 {notice.readCount}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
