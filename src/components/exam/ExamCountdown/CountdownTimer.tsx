"use client";

import { useEffect, useState } from "react";
import { CountdownTimerProps } from "@/types/exam";
import { getDaysUntil } from "@/hooks/exam/useExamSchedule";

export function CountdownTimer({
  targetDate,
  title,
  className = "",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const daysLeft = getDaysUntil(targetDate);
  const urgencyLevel =
    daysLeft <= 7 ? "high" : daysLeft <= 30 ? "medium" : "low";

  const urgencyStyles = {
    high: "bg-destructive/10 border-destructive text-destructive",
    medium: "bg-warning/10 border-warning text-warning-foreground",
    low: "bg-muted/10 border-muted text-text",
  };

  const boxStyles = {
    high: "bg-destructive/5",
    medium: "bg-warning/5",
    low: "bg-muted/5",
  };

  return (
    <div
      className={`
        p-4 rounded-lg shadow-sm border
        ${urgencyStyles[urgencyLevel]}
        ${className}
      `}
    >
      <h3 className="text-lg font-semibold mb-2 truncate" title={title}>
        {title}
      </h3>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className={`space-y-1 p-2 rounded ${boxStyles[urgencyLevel]}`}>
          <div className="text-2xl font-bold">{timeLeft.days}</div>
          <div className="text-xs text-text-muted">Days</div>
        </div>
        <div className={`space-y-1 p-2 rounded ${boxStyles[urgencyLevel]}`}>
          <div className="text-2xl font-bold">{timeLeft.hours}</div>
          <div className="text-xs text-text-muted">Hours</div>
        </div>
        <div className={`space-y-1 p-2 rounded ${boxStyles[urgencyLevel]}`}>
          <div className="text-2xl font-bold">{timeLeft.minutes}</div>
          <div className="text-xs text-text-muted">Mins</div>
        </div>
        <div className={`space-y-1 p-2 rounded ${boxStyles[urgencyLevel]}`}>
          <div className="text-2xl font-bold">{timeLeft.seconds}</div>
          <div className="text-xs text-text-muted">Secs</div>
        </div>
      </div>

      {/* Urgency Indicator */}
      <div className="mt-2 text-right">
        <span className={`text-xs ${urgencyStyles[urgencyLevel]}`}>
          {daysLeft === 0
            ? "Today!"
            : daysLeft === 1
            ? "Tomorrow!"
            : `${daysLeft} days remaining`}
        </span>
      </div>
    </div>
  );
}
