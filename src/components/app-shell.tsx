"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { getAccessibleNavItems, type Role } from "@/lib/domain";

export function AppShell({
  children,
  title,
  eyebrow = "Sprint 0",
  role = "admin",
}: {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  role?: Role;
}) {
  return (
    <Suspense
      fallback={
        <AppShellFrame title={title} eyebrow={eyebrow} role={role}>
          {children}
        </AppShellFrame>
      }
    >
      <AppShellWithSearchParams title={title} eyebrow={eyebrow} role={role}>
        {children}
      </AppShellWithSearchParams>
    </Suspense>
  );
}

function AppShellWithSearchParams({
  children,
  title,
  eyebrow,
  role,
}: {
  children: ReactNode;
  title: string;
  eyebrow: string;
  role: Role;
}) {
  const searchParams = useSearchParams();
  const queryRole = searchParams.get("role") as Role | null;
  const activeRole = queryRole ?? role;

  return (
    <AppShellFrame title={title} eyebrow={eyebrow} role={activeRole}>
      {children}
    </AppShellFrame>
  );
}

function AppShellFrame({
  children,
  title,
  eyebrow,
  role,
}: {
  children?: ReactNode;
  title: string;
  eyebrow: string;
  role: Role;
}) {
  const activeRole = role;
  const navItems = getAccessibleNavItems(activeRole);
  const roleHref = (href: string) => `${href}${href.includes("?") ? "&" : "?"}role=${activeRole}`;

  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href={roleHref("/dashboard")} className="flex items-center gap-3">
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
          <nav
            className="flex gap-2 overflow-x-auto pb-1 text-sm"
            aria-label={`${activeRole} navigation`}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={roleHref(item.href)}
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
