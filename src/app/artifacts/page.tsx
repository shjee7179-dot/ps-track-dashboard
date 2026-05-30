import { AppShell } from "@/components/app-shell";
import { ArtifactCard } from "@/components/artifacts";
import { Stat } from "@/components/ui";
import { artifacts } from "@/lib/domain";

export default function ArtifactsPage() {
  return (
    <AppShell title="산출물 목록" eyebrow="Artifacts / Student + Team">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="전체 산출물" value={`${artifacts.length}개`} tone="teal" />
        <Stat
          label="개인"
          value={`${artifacts.filter((artifact) => artifact.ownerType === "student").length}개`}
        />
        <Stat
          label="팀"
          value={`${artifacts.filter((artifact) => artifact.ownerType === "team").length}개`}
        />
        <Stat
          label="리뷰 중"
          value={`${artifacts.filter((artifact) => artifact.status === "in_review").length}개`}
          tone="amber"
        />
      </div>
      <div className="space-y-4">
        {artifacts.map((artifact) => (
          <ArtifactCard key={artifact.id} artifact={artifact} />
        ))}
      </div>
    </AppShell>
  );
}
