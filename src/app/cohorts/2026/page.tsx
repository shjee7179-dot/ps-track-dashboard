import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { RiskCard, ReminderRow } from "@/components/operations";
import { Card, Stat } from "@/components/ui";
import { mockRepositories } from "@/lib/mock-repositories";

export default async function CohortDashboardPage() {
  const [
    cohort,
    users,
    teams,
    learningPieces,
    riskSignals,
    reminderCandidates,
    artifacts,
    mentoringSessions,
  ] = await Promise.all([
    mockRepositories.cohorts.getActiveCohort(),
    mockRepositories.users.listUsers(),
    mockRepositories.cohorts.listTeams(),
    mockRepositories.learning.listLearningPieces(),
    mockRepositories.operations.listRiskSignals(),
    mockRepositories.operations.listReminderCandidates(),
    mockRepositories.artifacts.listArtifacts(),
    mockRepositories.operations.listMentoringSessions(),
  ]);
  const students = users.filter((user) => user.defaultRole === "student");

  return (
    <AppShell title="2026년 기수 운영 대시보드" eyebrow="Operator / Cohort 2026">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="참여자" value={`${students.length}명`} tone="teal" />
        <Stat label="팀" value={`${teams.length}개`} />
        <Stat label="학습피스" value={`${learningPieces.length}개`} />
        <Stat label="위험 신호" value={`${riskSignals.length}건`} tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-stone-950">위험 신호</h2>
            <Link href="/operations/risks" className="text-sm font-medium text-teal-800">
              전체 보기
            </Link>
          </div>
          {riskSignals.map((risk) => (
            <RiskCard key={risk.id} risk={risk} />
          ))}
        </section>
        <section className="space-y-6">
          <Card title="기수 정보">
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-stone-500">운영 기간</dt>
                <dd className="font-medium text-stone-950">
                  {cohort?.startsAt ?? "-"} - {cohort?.endsAt ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">협약</dt>
                <dd className="font-medium text-stone-950">{cohort?.agreementDate ?? "-"}</dd>
              </div>
            </dl>
            <Link href="/cohorts/2026/detail" className="mt-4 inline-flex text-sm font-medium text-teal-800">
              상세 보기
            </Link>
          </Card>
          <Card title="리마인드 추천">
            {reminderCandidates.map((reminder) => (
              <ReminderRow key={reminder.id} reminder={reminder} />
            ))}
          </Card>
          <Card title="운영 요약">
            <div className="grid gap-2 text-sm text-stone-600">
              <p>산출물 {artifacts.length}개 관리 중</p>
              <p>멘토링 {mentoringSessions.length}건 등록</p>
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
