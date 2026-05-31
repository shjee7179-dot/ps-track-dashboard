"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { canAccessPath, getAccessibleNavItems, type Role } from "@/lib/domain";
import { getMockSession, withRoleQuery } from "@/lib/session";

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
  const pathname = usePathname();
  const session = getMockSession(searchParams.get("role"), role);
  const canReadPage = canAccessPath(session.role, pathname);

  return (
    <AppShellFrame title={title} eyebrow={eyebrow} role={session.role} canReadPage={canReadPage}>
      {canReadPage ? children : <AccessDenied role={session.role} />}
    </AppShellFrame>
  );
}

function AppShellFrame({
  children,
  title,
  eyebrow,
  role,
  canReadPage = true,
}: {
  children?: ReactNode;
  title: string;
  eyebrow: string;
  role: Role;
  canReadPage?: boolean;
}) {
  const activeRole = role;
  const navItems = getAccessibleNavItems(activeRole);
  const roleHref = (href: string) => withRoleQuery(href, activeRole);

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
          {!canReadPage ? (
            <p className="mt-2 text-sm text-rose-700">현재 역할로 이 화면을 볼 수 없습니다.</p>
          ) : null}
        </div>
        {children}
      </main>
    </div>
  );
}

function AccessDenied({ role }: { role: Role }) {
  return (
    <section className="rounded-lg border border-rose-200 bg-rose-50 p-5">
      <p className="text-base font-semibold text-rose-950">접근 권한이 없습니다</p>
      <p className="mt-2 text-sm leading-6 text-rose-800">
        현재 선택된 역할은 <span className="font-medium">{role}</span>입니다. 이 화면은 role +
        scope 정책상 허용된 역할에서만 볼 수 있습니다.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={withRoleQuery("/dashboard", role)}
          className="rounded-md border border-rose-700 bg-rose-700 px-3 py-2 text-sm font-medium text-white"
        >
          내 대시보드로
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-800"
        >
          역할 다시 선택
        </Link>
      </div>
    </section>
  );
}
