"use client";

interface SessionSelectorProps {
  selectedSession: string | null;
  availableSessions: string[];
  onSessionChange: (session: string | null) => void;
  disabled?: boolean;
}

export default function SessionSelector({
  selectedSession,
  availableSessions,
  onSessionChange,
  disabled = false,
}: SessionSelectorProps) {
  if (disabled) {
    return (
      <select
        disabled
        className="w-full p-2 bg-surface-alt border border-border rounded-md
          text-text-muted cursor-not-allowed"
      >
        <option>Select Subject & Unit First</option>
      </select>
    );
  }

  // Sort sessions in reverse chronological order
  const sortedSessions = [...availableSessions].sort((a, b) => {
    const [monthA, yearA] = a.split(" ");
    const [monthB, yearB] = b.split(" ");
    
    if (yearA !== yearB) {
      return parseInt(yearB) - parseInt(yearA);
    }
    
    // Month order: January (0), May/June (1), October (2)
    const monthOrder: Record<string, number> = {
      January: 0,
      May: 1,
      June: 1,
      October: 2,
    };
    
    return (monthOrder[monthA] || 0) - (monthOrder[monthB] || 0);
  });

  return (
    <select
      value={selectedSession || ""}
      onChange={(e) => onSessionChange(e.target.value || null)}
      className="w-full p-2 bg-surface border border-border rounded-md
        text-text focus:ring-2 focus:ring-primary/20"
    >
      <option value="">Select Session</option>
      {sortedSessions.map((session) => (
        <option key={session} value={session}>
          {session}
        </option>
      ))}
    </select>
  );
}