import { Examination } from "@/types/exam";
import { ExamCard } from "./ExamCard";

interface ExamSectionProps {
  title: string;
  exams: Examination[];
  isSticky?: boolean;
  showCountdown?: boolean;
}

export function ExamSection({
  title,
  exams,
  isSticky = false,
  showCountdown = false,
}: ExamSectionProps) {
  if (exams.length === 0) return null;

  return (
    <section>
      {/* Section Header */}
      <div
        className={`
          relative
          ${isSticky ? "sticky top-0" : ""}
        `}
      >
        {/* Header Content */}
        <div className="bg-surface border-y border-border/40">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg text-primary">{title}</h2>
              <span
                className={`
                  text-sm px-2 py-1 rounded-full
                  ${
                    isSticky
                      ? "bg-primary/20 text-primary font-medium"
                      : "text-text-muted"
                  }
                `}
              >
                {exams.length} exam{exams.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Cards */}
      <div className="p-4 space-y-3">
        {exams.map((exam) => (
          <ExamCard
            key={exam.code}
            {...exam}
            emphasis={isSticky ? "high" : "normal"}
            showCountdown={showCountdown && isSticky}
          />
        ))}
      </div>
    </section>
  );
}