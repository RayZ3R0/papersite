import { Examination } from "@/types/exam";
import { format, differenceInDays, differenceInHours } from "date-fns";

interface ExamCardProps extends Examination {
  showCountdown?: boolean;
  emphasis?: "high" | "normal";
}

export function ExamCard({
  subject,
  title,
  time,
  duration,
  code,
  date,
  isRelevant,
  showCountdown = false,
  emphasis = "normal",
}: ExamCardProps) {
  // Calculate time until exam
  const now = new Date();
  const examDate = new Date(date);
  const daysUntil = differenceInDays(examDate, now);
  const hoursUntil = differenceInHours(examDate, now) % 24;

  const getTimeClass = () => {
    if (time === "Morning") {
      return isRelevant
        ? "bg-warning/50 text-warning-foreground"
        : "bg-warning/20 text-warning-foreground/70";
    }
    return isRelevant
      ? "bg-primary/50 text-primary-foreground"
      : "bg-primary/20 text-primary/70";
  };

  return (
    <div
      className={`
        p-4 rounded-lg border transition-shadow duration-200
        ${
          isRelevant
            ? "bg-primary/5 border-primary/30 hover:shadow-md hover:shadow-primary/5"
            : "border-border hover:border-border/80"
        }
        ${emphasis === "high" ? "shadow-sm" : ""}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium truncate ${isRelevant ? "text-primary" : ""}`}>
            {subject}
          </h3>
          <p className="text-sm text-text-muted truncate">{title}</p>
        </div>
        <span
          className={`
            shrink-0 text-xs px-2.5 py-1 rounded-full font-medium
            ${getTimeClass()}
          `}
        >
          {time}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <span className="text-text-muted font-medium">Duration:</span>
          <span className="ml-2">{duration}</span>
        </div>
        <div>
          <span className="text-text-muted font-medium">Code:</span>
          <span className="ml-2">{code}</span>
        </div>
      </div>

      {/* Countdown - only show for relevant exams */}
      {showCountdown && isRelevant && daysUntil >= 0 && (
        <div className={`
          mt-3 pt-3 border-t border-primary/10
          text-sm grid grid-cols-2 gap-2
        `}>
          <div className="space-y-1">
            <div className="font-medium text-primary/70">Days Until</div>
            <div className="text-2xl font-bold text-primary">{daysUntil}</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-primary/70">Hours</div>
            <div className="text-2xl font-bold text-primary">{hoursUntil}</div>
          </div>
        </div>
      )}
    </div>
  );
}