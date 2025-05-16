"use client";

import ProtectedContent from "@/components/auth/ProtectedContent";
import { ExamCalendar } from "@/components/exam/ExamCalendar/Calendar";
import { Examination } from "@/types/exam";
import routineData from "@/lib/data/routine.json";
import Link from "next/link";

// Cast the examinations data to ensure proper typing
const typedExaminations = routineData.examinations.map((exam) => ({
  ...exam,
  time: exam.time as "Morning" | "Afternoon",
})) as Examination[];

export default function ExamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedContent
      roles={["user", "moderator", "admin"]}
      message="Sign in to see your personalized exam schedule"
      fallback={
        <div className="container mx-auto p-4">
          <div className="bg-surface p-6 rounded-lg shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">
                IAL Examination Schedule
              </h2>
              <p className="text-text-muted">
                Sign in to view your personalized exam schedule and get
                countdown timers
              </p>
            </div>

            {/* Basic Calendar View for Non-authenticated Users */}
            <div className="mt-6">
              <ExamCalendar
                examinations={typedExaminations}
                className="max-w-3xl mx-auto"
              />
            </div>

            {/* Auth Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <Link
                href="/auth/login"
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      }
    >
      <div className="container mx-auto p-4">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </ProtectedContent>
  );
}
