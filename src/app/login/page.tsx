import Link from "next/link";
import { Card, StatusBadge } from "@/components/ui";
import { roleAssignments, users } from "@/lib/domain";
import { withRoleQuery } from "@/lib/session";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1fr_380px]">
        <section className="flex flex-col justify-center">
          <p className="text-sm font-medium text-teal-800">Sprint 0 Mock Login</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-semibold text-stone-950 sm:text-4xl">
            미래 의사과학자 챌린지 트랙 학습 여정 대시보드
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
            1차 구현에서는 실제 인증 연동 전 role + scope 흐름을 검증하기 위한
            역할 선택 화면으로 시작한다.
          </p>
        </section>
        <Card title="역할 선택" subtitle="선택 후 역할별 대시보드로 이동">
          <div className="space-y-3">
            {users.map((user) => {
              const assignment = roleAssignments.find((item) => item.userId === user.id);
              return (
                <Link
                  key={user.id}
                  href={withRoleQuery("/dashboard", user.defaultRole)}
                  className="block rounded-lg border border-stone-200 p-4 transition hover:border-teal-700 hover:bg-teal-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-stone-950">{user.name}</p>
                      <p className="mt-1 text-sm text-stone-500">{user.affiliation}</p>
                    </div>
                    <StatusBadge>{user.defaultRole}</StatusBadge>
                  </div>
                  <p className="mt-3 text-xs text-stone-500">
                    scope: {assignment?.scopeType} / {assignment?.scopeId}
                  </p>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </main>
  );
}
