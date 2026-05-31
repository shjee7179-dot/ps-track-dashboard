import { riskSignals, teams, users } from "@/lib/mock-data";
import type { ReminderCandidate, RiskSignal } from "@/lib/types";

export function getRiskSignalById(riskSignalId: string) {
  return riskSignals.find((risk) => risk.id === riskSignalId);
}

export function getRiskTargetName(risk: RiskSignal | ReminderCandidate) {
  if (risk.targetType === "student") {
    return users.find((user) => user.id === risk.targetId)?.name ?? risk.targetId;
  }
  return teams.find((team) => team.id === risk.targetId)?.name ?? risk.targetId;
}

export function getRiskTypeLabel(type: RiskSignal["riskType"]) {
  const labels: Record<RiskSignal["riskType"], string> = {
    learning_piece_delay: "학습피스 지연",
    artifact_missing: "산출물 미제출",
    mentoring_issue: "멘토링 이슈",
  };

  return labels[type];
}

export function getReminderStatusLabel(status: ReminderCandidate["sendStatus"]) {
  const labels: Record<ReminderCandidate["sendStatus"], string> = {
    pending: "발송 대기",
    sent: "발송 완료",
    skipped: "보류",
  };

  return labels[status];
}
