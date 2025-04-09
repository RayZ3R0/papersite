import { useState, useEffect } from "react";
import { Examination } from "@/types/exam";
import { format } from "date-fns";

interface ExamDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  exams: Examination[];
  date: string;
  className?: string;
}

export function ExamDetailsDrawer({
  isOpen,
  onClose,
  exams,
  date,
  className = "",
}: ExamDetailsDrawerProps) {
  // Handle animation states
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const formattedDate = format(new Date(date), "MMMM d, yyyy");

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/30 backdrop-blur-sm z-40
          transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0"}
          ${className}
        `}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
          fixed right-0 top-0 h-full w-full sm:w-96 bg-surface z-50
          shadow-xl border-l border-border flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{formattedDate}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/80 rounded-full transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content - added overflow-y-auto to make it scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {exams.length === 0 ? (
              <p className="text-text-muted text-center py-8">
                No exams scheduled for this day
              </p>
            ) : (
              exams.map((exam) => (
                <div
                  key={exam.code}
                  className={`
                    p-4 rounded-lg border border-border space-y-2
                    ${exam.isRelevant ? "bg-primary/5 border-primary/20" : ""}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{exam.subject}</h3>
                      <p className="text-sm text-text-muted">{exam.title}</p>
                    </div>
                    <span
                      className={`
                        text-xs px-2 py-1 rounded-full
                        ${
                          exam.time === "Morning"
                            ? "bg-warning/20 text-warning-foreground"
                            : "bg-primary/20 text-primary"
                        }
                      `}
                    >
                      {exam.time}
                    </span>
                  </div>

                  <div className="text-sm text-text-muted space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Time:</span>
                      <span>{exam.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Duration:</span>
                      <span>{exam.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Code:</span>
                      <span>{exam.code}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}