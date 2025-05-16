"use client";

import { useMemo, useState } from "react";
import { ExamListProps, Examination } from "@/types/exam";
import { formatDuration } from "@/hooks/exam/useExamSchedule";
import { format, isSameDay } from "date-fns";

export function ExamList({
  examinations,
  userSubjects,
  className = "",
  view = "detailed",
}: ExamListProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group exams by month
  const groupedExams = useMemo(() => {
    return examinations.reduce((acc, exam) => {
      const monthYear = format(new Date(exam.date), "MMMM yyyy");
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(exam);
      return acc;
    }, {} as Record<string, Examination[]>);
  }, [examinations]);

  // Sort months chronologically
  const sortedMonths = useMemo(() => {
    return Object.keys(groupedExams).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });
  }, [groupedExams]);

  const today = new Date();

  return (
    <div className={`space-y-6 ${className}`}>
      {sortedMonths.map((month) => (
        <div key={month} className="space-y-2">
          <h3 className="text-lg font-semibold text-text">{month}</h3>
          <div className="space-y-2">
            {groupedExams[month].map((exam) => {
              const examDate = new Date(exam.date);
              const isToday = isSameDay(examDate, today);

              return (
                <div
                  key={exam.code}
                  className={`
                    p-4 rounded-lg border transition-colors
                    ${isToday ? "border-primary bg-primary/5" : "border-border"}
                    ${
                      exam.isRelevant
                        ? "ring-1 ring-primary ring-opacity-50"
                        : ""
                    }
                    hover:bg-surface/80
                  `}
                >
                  {view === "detailed" ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{exam.subject}</h4>
                          <p className="text-sm text-text-muted">
                            {exam.title}
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`
                            text-sm px-2 py-1 rounded-full
                            ${
                              exam.time === "Morning"
                                ? "bg-warning/20 text-warning-foreground"
                                : "bg-primary/20 text-primary"
                            }
                          `}
                          >
                            {exam.time}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-text-muted">
                        <div>{format(examDate, "EEEE, do MMMM")}</div>
                        <div>Duration: {formatDuration(exam.duration)}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{exam.subject}</span>
                        <span className="text-sm text-text-muted ml-2">
                          {exam.time}
                        </span>
                      </div>
                      <div className="text-sm text-text-muted">
                        {format(examDate, "d MMM")}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {sortedMonths.length === 0 && (
        <div className="text-center py-8 text-text-muted">
          No exams found for the selected criteria
        </div>
      )}
    </div>
  );
}
