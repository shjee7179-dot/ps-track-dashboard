export type Role = "student" | "operator" | "mentor" | "pi" | "admin";

export type ScopeType =
  | "system"
  | "program"
  | "cohort"
  | "track"
  | "team"
  | "student";

export type Action = "read" | "create" | "update" | "delete" | "manage";

export type RoleAssignment = {
  id: string;
  userId: string;
  role: Role;
  scopeType: ScopeType;
  scopeId: string;
  status: "active" | "inactive";
};

export type User = {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  defaultRole: Role;
  status: "active" | "inactive";
};

export type Cohort = {
  id: string;
  name: string;
  agreementDate: string;
  startsAt: string;
  endsAt: string;
  status: "draft" | "active" | "closed";
};

export type LogEvent = {
  id: string;
  actor: string;
  event: string;
  target: string;
  occurredAt: string;
  severity: "info" | "notice" | "warning";
};

export const cohort2026: Cohort = {
  id: "cohort-2026-1",
  name: "2026년 1기",
  agreementDate: "2026-06",
  startsAt: "2026-07-01",
  endsAt: "2026-10-31",
  status: "draft",
};

export const users: User[] = [
  {
    id: "student-001",
    name: "김서연",
    email: "student@example.kr",
    affiliation: "예비 의사과학자",
    defaultRole: "student",
    status: "active",
  },
  {
    id: "operator-001",
    name: "운영자",
    email: "operator@example.kr",
    affiliation: "프로그램 운영팀",
    defaultRole: "operator",
    status: "active",
  },
  {
    id: "mentor-001",
    name: "이멘토",
    email: "mentor@example.kr",
    affiliation: "연구 멘토단",
    defaultRole: "mentor",
    status: "active",
  },
  {
    id: "pi-001",
    name: "박책임",
    email: "pi@example.kr",
    affiliation: "연구책임자",
    defaultRole: "pi",
    status: "active",
  },
  {
    id: "admin-001",
    name: "시스템 총괄",
    email: "admin@example.kr",
    affiliation: "시스템 관리",
    defaultRole: "admin",
    status: "active",
  },
];

export const roleAssignments: RoleAssignment[] = [
  {
    id: "ra-001",
    userId: "student-001",
    role: "student",
    scopeType: "student",
    scopeId: "student-001",
    status: "active",
  },
  {
    id: "ra-002",
    userId: "operator-001",
    role: "operator",
    scopeType: "cohort",
    scopeId: cohort2026.id,
    status: "active",
  },
  {
    id: "ra-003",
    userId: "mentor-001",
    role: "mentor",
    scopeType: "team",
    scopeId: "team-001",
    status: "active",
  },
  {
    id: "ra-004",
    userId: "pi-001",
    role: "pi",
    scopeType: "program",
    scopeId: "program-ps-track",
    status: "active",
  },
  {
    id: "ra-005",
    userId: "admin-001",
    role: "admin",
    scopeType: "system",
    scopeId: "system",
    status: "active",
  },
];

export const auditLogs: LogEvent[] = [
  {
    id: "audit-001",
    actor: "시스템 총괄",
    event: "PWA 설정 초안 생성",
    target: "pwa_settings",
    occurredAt: "2026-05-31 01:20",
    severity: "info",
  },
  {
    id: "audit-002",
    actor: "운영자",
    event: "2026년 1기 seed 데이터 확인",
    target: cohort2026.name,
    occurredAt: "2026-05-31 01:18",
    severity: "notice",
  },
];

export const accessLogs: LogEvent[] = [
  {
    id: "access-001",
    actor: "시스템 총괄",
    event: "로그인",
    target: "admin dashboard",
    occurredAt: "2026-05-31 01:16",
    severity: "info",
  },
  {
    id: "access-002",
    actor: "운영자",
    event: "역할 선택",
    target: "operator / cohort-2026-1",
    occurredAt: "2026-05-31 01:17",
    severity: "info",
  },
];

export function canAccess(
  assignment: RoleAssignment,
  action: Action,
  targetScopeType: ScopeType,
  targetScopeId: string,
) {
  if (assignment.status !== "active") return false;
  if (assignment.role === "admin" && assignment.scopeType === "system") {
    return true;
  }
  if (action === "delete" && assignment.role !== "admin") return false;
  if (assignment.scopeType === targetScopeType && assignment.scopeId === targetScopeId) {
    return true;
  }
  if (assignment.role === "operator" && targetScopeType !== "system") {
    return assignment.scopeType === "cohort";
  }
  if (assignment.role === "pi" && action === "read") {
    return ["program", "cohort", "team", "student"].includes(targetScopeType);
  }
  return false;
}

export function getDefaultAssignment(role: Role) {
  return roleAssignments.find((assignment) => assignment.role === role) ?? roleAssignments[0];
}

export const pwaSettings = {
  appName: "PS Track Dashboard",
  shortName: "PS Track",
  themeColor: "#0f766e",
  display: "standalone",
  installable: true,
};

export const systemSettings = [
  { key: "default_cohort", label: "기본 기수", value: cohort2026.name },
  { key: "reminder_mode", label: "리마인드 방식", value: "자동 추천 + 수동 발송" },
  { key: "survey_mode", label: "설문 방식", value: "외부 설문 링크 + 응답 여부 추적" },
  { key: "mobile_priority", label: "모바일 최적화", value: "학생 대시보드 우선" },
];
