"use client";

import { ExamFilterProps } from "@/types/exam";

export function ExamFilters({
  state,
  onChange,
  subjects,
  className = "",
}: ExamFilterProps) {
  // Hide entire component on mobile using Tailwind's responsive classes
  return (
    <div
      className={`hidden md:block space-y-4 p-4 bg-surface rounded-lg border border-border ${className}`}
    >
      {/* View Toggle */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">View</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ ...state, view: "calendar" })}
            className={`
              flex-1 px-3 py-1.5 text-sm rounded-md transition-colors
              ${
                state.view === "calendar"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted/80"
              }
            `}
          >
            Calendar
          </button>
          <button
            onClick={() => onChange({ ...state, view: "list" })}
            className={`
              flex-1 px-3 py-1.5 text-sm rounded-md transition-colors
              ${
                state.view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted/80"
              }
            `}
          >
            List
          </button>
        </div>
      </div>

      {/* Subject Filter */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">Subjects</h3>
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {subjects.map((subject) => (
            <label
              key={subject}
              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/80 p-1.5 rounded"
            >
              <input
                type="checkbox"
                checked={state.filters.subjects.includes(subject)}
                onChange={(e) => {
                  const newSubjects = e.target.checked
                    ? [...state.filters.subjects, subject]
                    : state.filters.subjects.filter((s) => s !== subject);
                  onChange({
                    ...state,
                    filters: { ...state.filters, subjects: newSubjects },
                  });
                }}
                className="rounded border-border text-primary focus:ring-primary"
              />
              {subject}
            </label>
          ))}
        </div>
      </div>

      {/* Time Filter */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">Time</h3>
        <div className="flex gap-4">
          {["Morning", "Afternoon"].map((time) => (
            <label
              key={time}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={state.filters.time.includes(time)}
                onChange={(e) => {
                  const newTimes = e.target.checked
                    ? [...state.filters.time, time]
                    : state.filters.time.filter((t) => t !== time);
                  onChange({
                    ...state,
                    filters: { ...state.filters, time: newTimes },
                  });
                }}
                className="rounded border-border text-primary focus:ring-primary"
              />
              {time}
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() =>
          onChange({
            ...state,
            filters: {
              subjects: [],
              dateRange: { start: null, end: null },
              time: [],
            },
          })
        }
        className="text-sm text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline w-full text-left"
      >
        Reset filters
      </button>
    </div>
  );
}
