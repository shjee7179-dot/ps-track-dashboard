import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/student", label: "학생" },
  { href: "/journeys/students", label: "여정" },
  { href: "/objects/learning-pieces", label: "학습피스" },
  { href: "/artifacts", label: "산출물" },
  { href: "/outcomes", label: "성과" },
  { href: "/pi/dashboard", label: "PI" },
  { href: "/mentoring/sessions", label: "멘토링" },
  { href: "/cohorts/2026", label: "운영" },
  { href: "/templates", label: "템플릿" },
  { href: "/surveys", label: "설문" },
  { href: "/reports", label: "리포트" },
  { href: "/notices", label: "공지" },
  { href: "/admin/users", label: "사용자" },
  { href: "/admin/roles", label: "권한" },
  { href: "/admin/audit-logs", label: "감사 로그" },
  { href: "/admin/access-logs", label: "접속 로그" },
  { href: "/admin/pwa", label: "PWA" },
  { href: "/admin/settings", label: "설정" },
];

export function AppShell({
  children,
  title,
  eyebrow = "Sprint 0",
}: {
  children: ReactNode;
  title: string;
  eyebrow?: string;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-700 text-sm font-bold text-white">
              PS
            </span>
            <span>
              <span className="block text-sm font-semibold text-stone-950">
                미래 의사과학자 챌린지 트랙
              </span>
              <span className="block text-xs text-stone-500">학습 여정 대시보드</span>
            </span>
          </Link>
          <nav className="flex gap-2 overflow-x-auto pb-1 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-md border border-stone-200 px-3 py-2 text-stone-700 transition hover:border-teal-700 hover:text-teal-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-medium text-teal-800">{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950 sm:text-3xl">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
