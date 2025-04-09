"use client";

import { useProfile } from "@/hooks/useProfile";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useExamScheduleV2 } from "@/hooks/exam/useExamScheduleV2";
import { ExamFilters } from "@/components/exam";
import { CalendarV2 } from "@/components/exam/ExamCalendar/CalendarV2";
import { CountdownTimerV2 } from "@/components/exam/ExamCountdown/CountdownTimerV2";
import { ExamList } from "@/components/exam/ExamList/ExamList";

export default function ExamsPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { examinations, nextExam, nextExamMonth, subjects, state, setState } =
    useExamScheduleV2();

  if (profileLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text">Exam Schedule</h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filters - Mobile Dropdown / Desktop Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <ExamFilters
            state={state}
            onChange={setState}
            subjects={subjects}
            className="sticky top-20"
          />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* Next Exam Countdown */}
          <CountdownTimerV2 targetExam={nextExam} />

          {/* Calendar or List View */}
          {state.view === "calendar" ? (
            <CalendarV2
              examinations={examinations}
              userSubjects={profile?.subjects}
              nextExamMonth={nextExamMonth}
            />
          ) : (
            <ExamList
              examinations={examinations}
              userSubjects={profile?.subjects}
              view="detailed"
            />
          )}
        </div>
      </div>
    </div>
  );
}
