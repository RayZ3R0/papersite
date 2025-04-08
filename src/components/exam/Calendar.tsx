"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday as isDateToday,
} from "date-fns";
import { useExamCalendar } from "@/hooks/exam/useExamCalendar";
import { UserSubjectConfig } from "@/types/profile";
import { Examination } from "@/types/exam";
import { ExamDetailsDrawer } from "./ExamDetailsDrawer";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

interface CalendarProps {
  examinations: Examination[];
  userSubjects?: UserSubjectConfig[];
  className?: string;
}

export function Calendar({
  examinations,
  userSubjects,
  className,
}: CalendarProps) {
  const { currentDate, setCurrentDate } = useExamCalendar({ userSubjects });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Get days for current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group exams by date
  const examsByDate = useMemo(() => {
    return examinations.reduce((acc, exam) => {
      const date = exam.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(exam);
      return acc;
    }, {} as Record<string, Examination[]>);
  }, [examinations]);

  // Get exams for selected date
  const selectedExams = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return examsByDate[dateStr] || [];
  }, [selectedDate, examsByDate]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className={cn("space-y-4", className)}>
        {/* Calendar navigation */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() - 1))
                )
              }
              className="p-2 hover:bg-accent rounded-md"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() + 1))
                )
              }
              className="p-2 hover:bg-accent rounded-md"
            >
              Next
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {daysInMonth.map((date) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const exams = examsByDate[dateStr] || [];
            const isToday = isDateToday(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);

            return (
              <button
                key={date.toString()}
                onClick={() => handleDateClick(date)}
                className={cn(
                  "relative p-2 h-24 border rounded-lg transition-colors",
                  "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring",
                  isSelected && "border-primary bg-primary/10",
                  isToday && "ring-2 ring-primary ring-opacity-50"
                )}
              >
                <span className="absolute top-2 left-2 text-sm font-medium">
                  {format(date, "d")}
                </span>
                {exams.length > 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="text-xs">
                      {exams.length}
                    </Badge>
                  </div>
                )}
                <div className="mt-6 space-y-1">
                  {exams.map((exam) => (
                    <div
                      key={exam.code}
                      className="text-xs truncate text-muted-foreground"
                    >
                      {exam.time === "Morning" ? "🌅" : "🌇"} {exam.subject}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <ExamDetailsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        date={selectedDate!}
        exams={selectedExams}
        userSubjects={userSubjects}
      />
    </>
  );
}
