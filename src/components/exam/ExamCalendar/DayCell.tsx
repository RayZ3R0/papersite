"use client";

import { format } from "date-fns";
import { DayCellProps } from "@/types/exam";

export default function DayCell({
  date,
  exams,
  isSelected,
  isToday,
  onClick,
  className = "",
}: DayCellProps) {
  // Sort exams by time (Morning first, then Afternoon) and relevance (relevant first)
  const sortedExams = [...exams].sort((a, b) => {
    if (a.isRelevant !== b.isRelevant) return b.isRelevant ? 1 : -1;
    return a.time.localeCompare(b.time);
  });

  const hasExams = exams.length > 0;
  const hasRelevantExams = exams.some((exam) => exam.isRelevant);
  const relevantCount = exams.filter((exam) => exam.isRelevant).length;

  // Determine cell emphasis based on exam relevance
  const getEmphasis = () => {
    if (!hasExams) return "bg-surface/30";
    if (hasRelevantExams)
      return "bg-primary/20 border-primary ring-2 ring-primary/30";
    return "bg-surface/50";
  };

  return (
    <div
      onClick={onClick}
      className={`
        group relative p-2 rounded-lg border transition-all cursor-pointer
        hover:bg-surface/80 hover:shadow-sm min-h-[40px] md:min-h-0
        ${getEmphasis()}
        ${
          isSelected
            ? "border-primary shadow-sm ring-2 ring-primary/40 !bg-primary/30"
            : "hover:border-border/80"
        }
        ${isToday ? "ring-2 ring-primary ring-opacity-50" : ""}
        ${className}
      `}
    >
      <div className="flex md:block">
        {/* Date Number - Centered on mobile, top-left on desktop */}
        <div className="flex justify-center md:justify-start w-full">
          <span
            className={`
              text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center
              transition-colors
              ${
                isToday
                  ? "bg-primary text-white"
                  : hasRelevantExams
                  ? "text-primary"
                  : "text-text-muted"
              }
              ${hasRelevantExams && !isToday ? "font-semibold" : ""}
            `}
          >
            {format(date, "d")}
          </span>
        </div>

        {/* Your Exam badge - Desktop only */}
        {hasRelevantExams && (
          <span className="hidden md:inline-block text-[10px] font-medium bg-primary/30 text-primary px-1.5 rounded absolute right-2 top-2">
            Your Exam{relevantCount > 1 ? "s" : ""}
          </span>
        )}

        {/* Mobile Exam Indicators */}
        {hasExams && (
          <div className="flex gap-1 mt-1 md:hidden justify-center">
            {hasRelevantExams && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
            {exams.some(e => !e.isRelevant) && (
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted/50" />
            )}
          </div>
        )}
      </div>

      {/* Desktop Only Content */}
      <div className="hidden md:block">
        {/* Exam Pills */}
        {hasExams && (
          <div className="space-y-1 mt-1">
            {sortedExams.slice(0, 2).map((exam) => (
              <div
                key={exam.code}
                className={`
                  text-[11px] leading-tight px-1.5 py-1 rounded
                  transition-colors
                  ${
                    exam.time === "Morning"
                      ? exam.isRelevant
                        ? "bg-warning/50 text-warning-foreground font-medium shadow-sm ring-1 ring-warning/40"
                        : "bg-warning/20 text-warning-foreground/70"
                      : exam.isRelevant
                      ? "bg-primary/50 text-primary-foreground font-medium shadow-sm ring-1 ring-primary/40"
                      : "bg-primary/20 text-primary/70"
                  }
                `}
                title={`${exam.subject} - ${exam.title} (${exam.time})${
                  exam.isRelevant ? " - Your Exam" : ""
                }`}
              >
                <div className="truncate flex items-center gap-1">
                  <span>{exam.subject}</span>
                  {exam.isRelevant && (
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                  )}
                </div>
              </div>
            ))}

            {/* More indicator */}
            {exams.length > 2 && (
              <div
                className={`
                  text-[11px] text-center py-0.5 px-1.5 rounded font-medium
                  ${
                    hasRelevantExams
                      ? "bg-primary/30 text-primary ring-1 ring-primary/20"
                      : "bg-muted/50 text-text-muted"
                  }
                `}
              >
                +{exams.length - 2} more
                {relevantCount > 2 && ` (${relevantCount - 2} yours)`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hover indicator */}
      <div
        className={`
          absolute inset-0 rounded-lg border-2
          ${hasRelevantExams ? "border-primary/50" : "border-border/40"}
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity
        `}
      />
    </div>
  );
}
