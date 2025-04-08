"use client";

import { useProfile } from "@/hooks/useProfile";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useExamScheduleV2 } from "@/hooks/exam/useExamScheduleV2";
import { ExamFilters } from "@/components/exam";
import { CalendarV2 } from "@/components/exam/ExamCalendar/CalendarV2";
import { CountdownTimerV2 } from "@/components/exam/ExamCountdown/CountdownTimerV2";
import { ExamList } from "@/components/exam/ExamList/ExamList";
import ProtectedContent from "@/components/auth/ProtectedContent";
import { useReturnTo } from "@/hooks/useReturnTo";
import { useAuth } from "@/components/auth/AuthContext";
import Link from "next/link";

export default function ExamsPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { examinations, nextExam, subjects, state, setState, nextExamMonth } =
    useExamScheduleV2();
  const { saveCurrentPath } = useReturnTo();
  const { user } = useAuth();
  const currentPath = saveCurrentPath();

  const examContent = (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text">Exam Schedule</h1>
      </div>

      {/* Loading State */}
      {profileLoading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        /* Main Content */
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
      )}

      {/* Mobile View Time Indicator */}
      <div className="fixed bottom-16 right-4 lg:hidden">
        <div className="bg-surface/95 backdrop-blur-sm shadow-lg rounded-full px-4 py-2 text-sm border border-border">
          {nextExam
            ? `Next: ${nextExam.subject} (${new Date(
                nextExam.date
              ).toLocaleDateString()})`
            : "No upcoming exams"}
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-2xl font-bold text-text">Exam Schedule</h1>
          <p className="text-text-muted">
            Sign in to view and manage your personalized exam schedule.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href={`/auth/login?returnTo=${encodeURIComponent(currentPath)}`}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href={`/auth/register?returnTo=${encodeURIComponent(
                currentPath
              )}`}
              className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return examContent;
}
