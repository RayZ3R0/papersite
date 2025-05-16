"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { CalendarViewProps, Examination } from "@/types/exam";
import DayCell from "@/components/exam/ExamCalendar/DayCell";
import { ExamDetailsDrawer } from "../ExamDrawer/ExamDetailsDrawer";

interface CalendarV2Props extends CalendarViewProps {
  nextExamMonth: Date;
}

export function CalendarV2({
  examinations,
  userSubjects,
  nextExamMonth,
  className = "",
}: CalendarV2Props) {
  const [currentDate, setCurrentDate] = useState(startOfMonth(nextExamMonth));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Update current date when next exam month changes
  useEffect(() => {
    setCurrentDate(startOfMonth(nextExamMonth));
  }, [nextExamMonth]);

  // Get days for current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group exams by date
  const examsByDate = examinations.reduce((acc, exam) => {
    const date = exam.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(exam);
    return acc;
  }, {} as Record<string, Examination[]>);

  // Navigation handlers
  const goToPreviousMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const goToToday = () => setCurrentDate(startOfMonth(nextExamMonth));

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Count relevant exams for the current month
  const relevantExamsCount = examinations.filter(
    (exam) =>
      format(parseISO(exam.date), "yyyy-MM") ===
        format(currentDate, "yyyy-MM") && exam.isRelevant
  ).length;

  return (
    <div
      className={`bg-surface rounded-lg shadow-sm border border-border ${className}`}
    >
      {/* Calendar Header */}
      <div className="flex justify-between items-center p-4 border-b border-border">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          {relevantExamsCount > 0 && (
            <p className="text-sm text-primary">
              {relevantExamsCount} exam{relevantExamsCount !== 1 ? "s" : ""}{" "}
              this month
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-muted/80 rounded-full transition-colors"
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-muted/80 rounded-full transition-colors"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-2">
        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-text-muted py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((date) => {
            const dateStr = format(date, "yyyy-MM-dd");
            return (
              <DayCell
                key={dateStr}
                date={date}
                exams={examsByDate[dateStr] || []}
                isSelected={dateStr === selectedDate}
                isToday={format(new Date(), "yyyy-MM-dd") === dateStr}
                onClick={() => handleDateSelect(dateStr)}
                className="aspect-square"
              />
            );
          })}
        </div>
      </div>

      {/* Exam Details Drawer */}
      <ExamDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        exams={selectedDate ? examsByDate[selectedDate] || [] : []}
        date={selectedDate || ""}
      />
    </div>
  );
}
