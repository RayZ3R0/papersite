"use client";

import { useEffect, useState } from "react";
import { Examination } from "@/types/exam";
import { format, formatDistanceStrict } from "date-fns";

interface CountdownTimerV2Props {
  targetExam: Examination | null;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimerV2({
  targetExam,
  className = "",
}: CountdownTimerV2Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!targetExam) return;

    const calculateTimeLeft = () => {
      const examDate = new Date(targetExam.date);
      const now = new Date();
      const difference = examDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetExam]);

  if (!targetExam) {
    return (
      <div
        className={`bg-surface p-6 rounded-lg shadow-sm border border-border ${className}`}
      >
        <p className="text-center text-text-muted">
          No upcoming exams scheduled
        </p>
      </div>
    );
  }

  const examDate = new Date(targetExam.date);
  const formattedDate = format(examDate, "MMMM d, yyyy");
  const timeAway = formatDistanceStrict(examDate, new Date());

  return (
    <div
      className={`
        bg-surface p-6 rounded-lg shadow-sm border
        ${
          targetExam.isRelevant
            ? "border-primary ring-1 ring-primary/10"
            : "border-border"
        }
        ${className}
      `}
    >
      <div className="space-y-4">
        {/* Exam Details */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
            <span>{targetExam.subject}</span>
            {targetExam.isRelevant && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                Your Exam
              </span>
            )}
          </h3>
          <p className="text-text-muted">{targetExam.title}</p>
          <p className="text-sm font-medium text-primary">
            {formattedDate} ({targetExam.time})
          </p>
        </div>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <div
            className={`
            p-2 rounded-lg text-center 
            ${targetExam.isRelevant ? "bg-primary/10" : "bg-muted/30"}
          `}
          >
            <div className="text-xl sm:text-2xl font-bold">{timeLeft.days}</div>
            <div className="text-xs sm:text-sm text-text-muted">Days</div>
          </div>
          <div
            className={`
            p-2 rounded-lg text-center
            ${targetExam.isRelevant ? "bg-primary/10" : "bg-muted/30"}
          `}
          >
            <div className="text-xl sm:text-2xl font-bold">
              {timeLeft.hours}
            </div>
            <div className="text-xs sm:text-sm text-text-muted">Hours</div>
          </div>
          <div
            className={`
            p-2 rounded-lg text-center
            ${targetExam.isRelevant ? "bg-primary/10" : "bg-muted/30"}
          `}
          >
            <div className="text-xl sm:text-2xl font-bold">
              {timeLeft.minutes}
            </div>
            <div className="text-xs sm:text-sm text-text-muted">Minutes</div>
          </div>
          <div
            className={`
            p-2 rounded-lg text-center
            ${targetExam.isRelevant ? "bg-primary/10" : "bg-muted/30"}
          `}
          >
            <div className="text-xl sm:text-2xl font-bold">
              {timeLeft.seconds}
            </div>
            <div className="text-xs sm:text-sm text-text-muted">Seconds</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-1">
          <div className="text-sm">
            <span className="text-text-muted">Time: </span>
            <span className="font-medium">{targetExam.time}</span>
            <span className="text-text-muted"> • </span>
            <span className="text-text-muted">Duration: </span>
            <span className="font-medium">{targetExam.duration}</span>
          </div>
          <div className="text-sm text-text-muted">{timeAway} until exam</div>
        </div>
      </div>
    </div>
  );
}
