"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from "date-fns";
import { CalendarViewProps, Examination } from "@/types/exam";
import DayCell from "@/components/exam/ExamCalendar/DayCell";

export function ExamCalendar({
  examinations,
  userSubjects,
  onDateSelect,
  className = "",
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

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
  const goToToday = () => setCurrentDate(new Date());

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={`bg-surface rounded-lg shadow p-4 ${className}`}>
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-muted/80 rounded-full transition-colors"
          >
            ←
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 hover:bg-muted/80 rounded-md transition-colors text-sm"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-muted/80 rounded-full transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="w-full">
        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
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
                isSelected={false}
                isToday={format(new Date(), "yyyy-MM-dd") === dateStr}
                onClick={() => onDateSelect?.(dateStr)}
                className="aspect-square"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
