import { AppShell } from "@/components/app-shell";
import { LearningPieceCard } from "@/components/journey";
import { Stat } from "@/components/ui";
import { learningPieces, studentLearningPieceStatuses } from "@/lib/domain";

const studentId = "student-001";

export default function LearningPiecesPage() {
  return (
    <AppShell title="학습피스 목록" eyebrow="Learning Objects / Learning Pieces">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="학습피스" value={`${learningPieces.length}개`} tone="teal" />
        <Stat
          label="제출 필요"
          value={`${learningPieces.filter((piece) => piece.requiresSubmission).length}개`}
        />
        <Stat
          label="승인 필요"
          value={`${learningPieces.filter((piece) => piece.requiresApproval).length}개`}
          tone="amber"
        />
        <Stat
          label="평가 필요"
          value={`${learningPieces.filter((piece) => piece.requiresEvaluation).length}개`}
        />
      </div>
      <div className="space-y-4">
        {learningPieces.map((learningPiece) => (
          <LearningPieceCard
            key={learningPiece.id}
            learningPiece={learningPiece}
            status={studentLearningPieceStatuses.find(
              (status) =>
                status.studentId === studentId && status.learningPieceId === learningPiece.id,
            )}
          />
        ))}
      </div>
    </AppShell>
  );
}
