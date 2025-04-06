'use client';

import { Grade, GRADES, EXAM_SESSIONS } from '@/types/profile';

interface UnitConfigProps {
  unitName: string;
  targetGrade: Grade;
  examSession: string;
  onGradeChange: (grade: Grade) => void;
  onSessionChange: (session: string) => void;
  className?: string;
}

export default function UnitConfig({
  unitName,
  targetGrade,
  examSession,
  onGradeChange,
  onSessionChange,
  className = ''
}: UnitConfigProps) {
  // Get available years (current year and next year)
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];
  
  // Get available sessions with years
  const availableSessions = years.flatMap(year => 
    EXAM_SESSIONS.map(session => `${session} ${year}`)
  );

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex-1">
        <label className="block text-xs text-text-muted mb-1">Target Grade</label>
        <select
          value={targetGrade}
          onChange={(e) => onGradeChange(e.target.value as Grade)}
          className="w-full text-sm bg-surface border rounded p-1.5 hover:border-primary/50 transition-colors"
        >
          {GRADES.map(grade => (
            <option key={grade} value={grade}>{grade}</option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label className="block text-xs text-text-muted mb-1">Exam Session</label>
        <select
          value={examSession}
          onChange={(e) => onSessionChange(e.target.value)}
          className="w-full text-sm bg-surface border rounded p-1.5 hover:border-primary/50 transition-colors"
        >
          {availableSessions.map(session => (
            <option key={session} value={session}>{session}</option>
          ))}
        </select>
      </div>
    </div>
  );
}