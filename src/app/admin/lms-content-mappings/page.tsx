import { createLmsContentMappingAction } from "@/app/admin/lms-content-mappings/actions";
import { AppShell } from "@/components/app-shell";
import { Card, Stat, StatusBadge } from "@/components/ui";
import { getContentById, getModuleById } from "@/lib/domain";
import { repositories } from "@/lib/repositories";
import type {
  LmsContentGroup,
  LmsContentMappingActivationRule,
  LmsContentMappingStatus,
  LmsContentType,
} from "@/lib/lms/contracts";

const updateMessages: Record<string, string> = {
  created: "LMS 콘텐츠 매핑이 저장되었습니다.",
  denied: "현재 역할/scope에서는 LMS 콘텐츠 매핑을 생성할 수 없습니다.",
  duplicate: "이미 같은 학습피스 또는 LMS target이 매핑되어 있습니다.",
  invalid: "필수 입력값 또는 LMS 분류값을 확인해 주세요.",
};

const contentGroupOptions: Array<{ value: LmsContentGroup; label: string }> = [
  { value: "regular", label: "정규교육과정" },
  { value: "subscription", label: "구독" },
  { value: "community", label: "커뮤니티" },
];

const contentTypeOptions: Array<{ value: LmsContentType; label: string }> = [
  { value: "offline", label: "집합" },
  { value: "realtime", label: "실시간" },
  { value: "hyflex", label: "하이플렉스" },
  { value: "online", label: "온라인" },
  { value: "knowledge", label: "지식" },
  { value: "ebook", label: "전자책" },
  { value: "learning_group", label: "학습모임" },
  { value: "seminar", label: "세미나" },
];

const activationRuleOptions: Array<{
  value: LmsContentMappingActivationRule;
  label: string;
}> = [
  { value: "record_exists", label: "입과/신청 기록 존재" },
  { value: "participation_active", label: "참여 상태 활성" },
  { value: "completion_completed", label: "수료 완료" },
];

const statusOptions: Array<{ value: LmsContentMappingStatus; label: string }> = [
  { value: "draft", label: "초안" },
  { value: "active", label: "활성" },
  { value: "inactive", label: "비활성" },
];

function getDefaultContentType(pieceType: string): LmsContentType {
  if (pieceType === "video" || pieceType === "reading") return "online";
  if (pieceType === "workshop") return "realtime";
  if (pieceType === "practice") return "online";
  return "online";
}

function getDefaultActivationRule(pieceType: string): LmsContentMappingActivationRule {
  if (pieceType === "video" || pieceType === "reading") return "completion_completed";
  return "record_exists";
}

export default async function LmsContentMappingsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; update?: string; mapping?: string }>;
}) {
  const params = await searchParams;
  const [cohort, learningPieces] = await Promise.all([
    repositories.cohorts.getActiveCohort(),
    repositories.learning.listLearningPieces(),
  ]);
  const cohortId = cohort?.id ?? "cohort-2026";
  const mappings = await repositories.lms.contentMappings.listMappings({ cohortId });
  const mappingByLearningPieceId = new Map(
    mappings.map((mapping) => [mapping.learningPieceId, mapping]),
  );
  const activeMappings = mappings.filter((mapping) => mapping.status === "active");
  const updateMessage = params.update ? updateMessages[params.update] : undefined;

  return (
    <AppShell title="LMS 콘텐츠 매핑" eyebrow="Operations / LMS Mapping">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="기수" value={cohort?.name ?? cohortId} tone="teal" />
        <Stat label="학습피스" value={`${learningPieces.length}개`} />
        <Stat label="매핑 완료" value={`${mappings.length}개`} tone="amber" />
        <Stat label="활성 매핑" value={`${activeMappings.length}개`} />
      </div>

      {updateMessage ? (
        <div className="mb-4 rounded-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
          {updateMessage}
          {params.mapping ? <span className="ml-2 text-stone-500">mapping: {params.mapping}</span> : null}
        </div>
      ) : null}

      <div className="grid gap-6">
        <Card
          title="학습피스별 LMS target"
          subtitle="운영자가 AlphaCampus 콘텐츠/차수 식별자를 PS Track 학습피스에 연결"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="py-3 pr-4 font-medium">학습피스</th>
                  <th className="py-3 pr-4 font-medium">PS Track 객체</th>
                  <th className="py-3 pr-4 font-medium">현재 매핑</th>
                  <th className="py-3 font-medium">신규 매핑</th>
                </tr>
              </thead>
              <tbody>
                {learningPieces.map((learningPiece) => {
                  const moduleInfo = getModuleById(learningPiece.moduleId);
                  const content = getContentById(learningPiece.contentId);
                  const mapping = mappingByLearningPieceId.get(learningPiece.id);
                  return (
                    <tr key={learningPiece.id} className="border-b border-stone-100 align-top">
                      <td className="py-4 pr-4">
                        <p className="font-medium text-stone-950">{learningPiece.title}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <StatusBadge>{learningPiece.id}</StatusBadge>
                          <StatusBadge>{learningPiece.pieceType}</StatusBadge>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-stone-600">
                        <p>{moduleInfo?.title ?? learningPiece.moduleId}</p>
                        <p className="mt-1 text-xs text-stone-500">
                          {content?.title ?? learningPiece.contentId ?? "콘텐츠 미지정"}
                        </p>
                      </td>
                      <td className="py-4 pr-4">
                        {mapping ? (
                          <div className="grid gap-2">
                            <div className="flex flex-wrap gap-2">
                              <StatusBadge>{mapping.status}</StatusBadge>
                              <StatusBadge>{mapping.contentGroup}</StatusBadge>
                              <StatusBadge>{mapping.contentType}</StatusBadge>
                            </div>
                            <p className="font-medium text-stone-950">{mapping.lmsContentId}</p>
                            <p className="text-xs text-stone-500">
                              {mapping.lmsCourseRoundId ?? "차수 없음"} / {mapping.activationRule}
                            </p>
                          </div>
                        ) : (
                          <span className="text-stone-500">미매핑</span>
                        )}
                      </td>
                      <td className="py-4">
                        {mapping ? (
                          <p className="max-w-sm text-xs leading-5 text-stone-500">
                            1차 구현에서는 학습피스당 하나의 LMS target만 허용합니다.
                          </p>
                        ) : (
                          <form
                            action={createLmsContentMappingAction}
                            className="grid min-w-[460px] gap-3"
                          >
                            <input type="hidden" name="role" value={params.role ?? "operator"} />
                            <input type="hidden" name="cohortId" value={cohortId} />
                            <input type="hidden" name="moduleId" value={learningPiece.moduleId} />
                            <input
                              type="hidden"
                              name="contentId"
                              value={learningPiece.contentId ?? learningPiece.id}
                            />
                            <input
                              type="hidden"
                              name="learningPieceId"
                              value={learningPiece.id}
                            />
                            <div className="grid gap-2 sm:grid-cols-2">
                              <label className="grid gap-1">
                                <span className="text-xs font-medium text-stone-600">
                                  LMS 콘텐츠 ID
                                </span>
                                <input
                                  name="lmsContentId"
                                  required
                                  placeholder="예: alpha-content-uuid"
                                  className="h-10 rounded-md border border-stone-200 bg-white px-3 text-stone-700"
                                />
                              </label>
                              <label className="grid gap-1">
                                <span className="text-xs font-medium text-stone-600">
                                  LMS 차수 ID
                                </span>
                                <input
                                  name="lmsCourseRoundId"
                                  placeholder="선택 입력"
                                  className="h-10 rounded-md border border-stone-200 bg-white px-3 text-stone-700"
                                />
                              </label>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-4">
                              <label className="grid gap-1">
                                <span className="text-xs font-medium text-stone-600">그룹</span>
                                <select
                                  name="contentGroup"
                                  defaultValue="regular"
                                  className="h-10 rounded-md border border-stone-200 bg-white px-2 text-stone-700"
                                >
                                  {contentGroupOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="grid gap-1">
                                <span className="text-xs font-medium text-stone-600">유형</span>
                                <select
                                  name="contentType"
                                  defaultValue={getDefaultContentType(learningPiece.pieceType)}
                                  className="h-10 rounded-md border border-stone-200 bg-white px-2 text-stone-700"
                                >
                                  {contentTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="grid gap-1">
                                <span className="text-xs font-medium text-stone-600">활성 규칙</span>
                                <select
                                  name="activationRule"
                                  defaultValue={getDefaultActivationRule(learningPiece.pieceType)}
                                  className="h-10 rounded-md border border-stone-200 bg-white px-2 text-stone-700"
                                >
                                  {activationRuleOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="grid gap-1">
                                <span className="text-xs font-medium text-stone-600">상태</span>
                                <select
                                  name="status"
                                  defaultValue="draft"
                                  className="h-10 rounded-md border border-stone-200 bg-white px-2 text-stone-700"
                                >
                                  {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <label className="inline-flex items-center gap-2 text-xs text-stone-600">
                                <input
                                  type="checkbox"
                                  name="required"
                                  defaultChecked
                                  className="h-4 w-4 rounded border-stone-300"
                                />
                                필수 여정
                              </label>
                              <button
                                type="submit"
                                className="h-10 rounded-md border border-teal-700 bg-teal-700 px-3 text-sm font-medium text-white"
                              >
                                매핑 저장
                              </button>
                            </div>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Server Action 설계" subtitle="1차 구현 범위와 후속 확장 기준">
          <div className="grid gap-4 text-sm leading-6 text-stone-700 md:grid-cols-3">
            <div>
              <p className="font-semibold text-stone-950">입력 검증</p>
              <p className="mt-1">
                cohort, module, content, learning piece, LMS content id와 enum 값을 서버에서 다시
                검증한다.
              </p>
            </div>
            <div>
              <p className="font-semibold text-stone-950">권한</p>
              <p className="mt-1">
                role + scope 기준으로 cohort create 권한을 확인한 뒤 repository create를 실행한다.
              </p>
            </div>
            <div>
              <p className="font-semibold text-stone-950">저장소</p>
              <p className="mt-1">
                `repositories.lms.contentMappings`를 경유하므로 mock/postgres provider 전환을 따른다.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
