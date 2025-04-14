"use client";

import { useEffect, useState } from "react";
import { useExamScheduleV2 } from "@/hooks/exam/useExamScheduleV2";
import { formatDistanceStrict } from "date-fns";
import Link from "next/link";

export function MiniExamCountdown() {
  const { nextExam } = useExamScheduleV2();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
  });

  useEffect(() => {
    if (!nextExam) return;

    const calculateTimeLeft = () => {
      const examDate = new Date(nextExam.date);
      const now = new Date();
      const difference = examDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [nextExam]);

  if (!nextExam) {
    return null; // Don't show anything if no exam
  }

  return (
    <Link href="/exams" className="block">
      <div className={`
        px-4 py-3 mx-2 my-2 rounded-md
        ${nextExam.isRelevant 
          ? "bg-primary/10 hover:bg-primary/15" 
          : "bg-surface-hover/30 hover:bg-surface-hover/50"
        }
        transition-colors duration-150
      `}>
        <div className="space-y-2">
          {/* Subject and Badge */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm truncate pr-2">{nextExam.subject}</span>
            {nextExam.isRelevant && (
              <div className="shrink-0">
                <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-full font-semibold">
                  Your Exam
                </span>
              </div>
            )}
          </div>

          {/* Time Info */}
          <div className="flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center">
              <span className="text-primary/80 font-medium">{nextExam.time}</span>
            </div>
            <div className="flex items-center gap-1 font-medium">
              {timeLeft.days > 0 && (
                <>
                  <span className="tabular-nums">{timeLeft.days}</span>
                  <span className="text-text-muted/80">d</span>
                </>
              )}
              <span className="tabular-nums">{timeLeft.hours}</span>
              <span className="text-text-muted/80">h</span>
              <span className="text-text-muted/80 font-normal ml-0.5">left</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
