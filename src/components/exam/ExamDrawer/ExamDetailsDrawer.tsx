import { useState, useEffect } from "react";
import { Examination } from "@/types/exam";
import { format } from "date-fns";
import { ExamSection } from "./ExamSection";

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
      // Prevent body scroll when drawer is open on mobile
      if (window.innerWidth < 768) {
        document.body.style.overflow = "hidden";
      }
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      // Restore body scroll when drawer is closed
      document.body.style.overflow = "";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  // Separate exams into user's exams and other exams
  const userExams = exams.filter((exam) => exam.isRelevant);
  const otherExams = exams.filter((exam) => !exam.isRelevant);
  
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

      {/* Drawer Container */}
      <div
        className={`
          fixed inset-x-0 md:inset-x-auto md:right-0 bottom-0 md:top-16
          w-full md:w-[448px] h-[85vh] md:h-[calc(100vh-4rem)]
          bg-surface z-50
          transition-transform duration-300 ease-out
          transform
          ${
            isOpen
              ? "translate-y-0 md:translate-x-0"
              : "translate-y-full md:translate-y-0 md:translate-x-full"
          }
          shadow-xl border-t md:border-l border-border
          rounded-t-xl md:rounded-none
          flex flex-col
        `}
      >
        {/* Drag Handle - Mobile Only */}
        <div className="md:hidden w-full flex justify-center pt-2 pb-1">
          <div className="w-8 h-1 rounded-full bg-border/60" />
        </div>

        {/* Main Header - Fixed */}
        <div className="flex-none border-b border-border bg-surface/95 backdrop-blur-sm">
          <div className="px-4 py-3 flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">{formattedDate}</h2>
              {userExams.length > 0 && (
                <p className="text-sm text-primary">
                  You have {userExams.length} exam{userExams.length !== 1 ? "s" : ""} on
                  this day
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-3 -mr-2 hover:bg-muted/80 rounded-full transition-colors"
              aria-label="Close drawer"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          {exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted p-4">
              <p className="text-center">No exams scheduled for this day</p>
            </div>
          ) : (
            <div className="pb-safe">
              {/* User's Exams Section */}
              {userExams.length > 0 && (
                <ExamSection
                  title="Your Exams"
                  exams={userExams}
                  isSticky={true}
                  showCountdown={true}
                />
              )}

              {/* Other Exams Section */}
              {otherExams.length > 0 && (
                <div className="mt-6 mb-4 md:mb-4 pb-16 md:pb-0">
                  <ExamSection
                    title="Other Exams"
                    exams={otherExams}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}