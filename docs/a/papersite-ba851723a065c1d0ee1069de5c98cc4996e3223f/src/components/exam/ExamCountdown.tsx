"use client";

import { useState, useEffect, useMemo } from "react";
import { formatDistance } from "date-fns";
import { UserSubjectConfig } from "@/types/profile";
import { Examination } from "@/types/exam";
import { cn } from "@/lib/utils";

interface ExamCountdownProps {
  examinations: Examination[];
  userSubjects?: UserSubjectConfig[];
  className?: string;
}

export function ExamCountdown({
  examinations,
  userSubjects,
  className,
}: ExamCountdownProps) {
  const [now, setNow] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Find next relevant exam
  const nextExam = useMemo(() => {
    if (!userSubjects?.length) return null;

    const userSubjectCodes = userSubjects.map((s) => s.subjectCode);
    const relevantExams = examinations
      .filter(
        (exam) =>
          userSubjectCodes.includes(exam.subject) && new Date(exam.date) > now
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return relevantExams[0] || null;
  }, [examinations, userSubjects, now]);

  // Calculate time until exam
  const timeUntilExam = useMemo(() => {
    if (!nextExam) return null;
    return formatDistance(new Date(nextExam.date), now, { addSuffix: true });
  }, [nextExam, now]);

  if (!userSubjects?.length) {
    return (
      <div
        className={cn("p-4 rounded-lg border bg-card text-center", className)}
      >
        <p className="text-lg font-medium">Set up your subjects</p>
        <p className="text-sm text-muted-foreground">
          Add subjects to your profile to see your upcoming exams
        </p>
      </div>
    );
  }

  if (!nextExam) {
    return (
      <div
        className={cn("p-4 rounded-lg border bg-card text-center", className)}
      >
        <p className="text-lg font-medium">All done!</p>
        <p className="text-sm text-muted-foreground">
          No more exams scheduled for your subjects
        </p>
      </div>
    );
  }

  return (
    <div className={cn("p-4 rounded-lg border bg-card", className)}>
      <h3 className="text-lg font-semibold mb-2">Your Next Exam</h3>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-primary">{timeUntilExam}</p>
        <div>
          <p className="font-medium">{nextExam.title}</p>
          <p className="text-sm text-muted-foreground">
            {nextExam.subject} ({nextExam.code})
          </p>
          <p className="text-sm text-muted-foreground">
            {nextExam.day}, {nextExam.time} • {nextExam.duration}
          </p>
        </div>
      </div>
    </div>
  );
}
