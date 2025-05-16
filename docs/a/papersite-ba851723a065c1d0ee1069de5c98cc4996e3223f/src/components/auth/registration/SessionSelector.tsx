import { ExamSession } from "@/types/registration";

interface SessionSelectorProps {
  currentSession: ExamSession;
  onChange: (session: ExamSession) => void;
}

const SESSIONS: ExamSession[] = [
  "May 2025",
  "October 2025",
  "January 2026",
  "May 2026",
  "October 2026",
];

export function SessionSelector({
  currentSession,
  onChange,
}: SessionSelectorProps) {
  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <p className="text-sm font-medium text-text">
        Select your examination session
      </p>

      <div className="grid grid-cols-1 gap-3">
        {SESSIONS.map((session) => (
          <button
            key={session}
            type="button"
            onClick={() => onChange(session)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200
              text-left
              ${
                currentSession === session
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-text">{session}</span>
              <div
                className={`
                w-5 h-5 rounded-full border-2 transition-colors
                flex items-center justify-center
                ${
                  currentSession === session
                    ? "border-primary bg-primary text-white"
                    : "border-border"
                }
              `}
              >
                {currentSession === session && (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="text-sm text-text-muted mt-4">
        Choose the examination session that best fits your study timeline
      </p>
    </div>
  );
}
