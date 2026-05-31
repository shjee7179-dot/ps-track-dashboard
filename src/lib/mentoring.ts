import { mentoringSessions, teams, users } from "@/lib/mock-data";
import type { MentoringSession } from "@/lib/types";

export function getMentoringSessionById(sessionId: string) {
  return mentoringSessions.find((session) => session.id === sessionId);
}

export function getMentoringTargetName(session: MentoringSession) {
  if (session.targetType === "student") {
    return users.find((user) => user.id === session.targetId)?.name ?? session.targetId;
  }
  return teams.find((team) => team.id === session.targetId)?.name ?? session.targetId;
}

export function getMentoringStatusLabel(status: MentoringSession["status"]) {
  const labels: Record<MentoringSession["status"], string> = {
    scheduled: "예정",
    completed: "완료",
    absent: "불참",
    cancelled: "취소",
  };

  return labels[status];
}
