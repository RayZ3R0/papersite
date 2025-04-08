'use client';

import { useState, useMemo, useEffect } from 'react';
import { parseISO, isBefore, startOfMonth, isAfter } from 'date-fns';
import { ExamSession } from '@/types/sessions';
import { UserSubjectConfig } from '@/types/profile';
import routineData from '@/lib/data/routine.json';

// Helper to get next exam session
const getNextExamSession = (): ExamSession | undefined => {
  const now = new Date();
  const sessions: ExamSession[] = [
    "May 2025",
    "June 2025",
    "October 2025",
    "January 2026",
    "May 2026",
    "June 2026",
    "October 2026"
  ];

  return sessions.find(session => isAfter(parseISO(session), now));
};

// Helper to get earliest relevant exam date
const getEarliestRelevantExamDate = (userSubjects?: UserSubjectConfig[]) => {
  if (!userSubjects || userSubjects.length === 0) {
    return getNextExamSession() ? parseISO(getNextExamSession()!) : new Date();
  }

  const userSubjectCodes = userSubjects.map(s => s.subjectCode);
  const now = new Date();

  const relevantExams = routineData.examinations
    .filter(exam => 
      userSubjectCodes.includes(exam.subject) && 
      isAfter(parseISO(exam.date), now)
    )
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  return relevantExams[0] 
    ? startOfMonth(parseISO(relevantExams[0].date))
    : new Date();
};

export interface UseExamCalendarProps {
  userSubjects?: UserSubjectConfig[];
}

export function useExamCalendar({ userSubjects }: UseExamCalendarProps = {}) {
  // Get the earliest exam date from routine data considering user subjects
  const defaultDate = useMemo(() => 
    getEarliestRelevantExamDate(userSubjects),
    [userSubjects]
  );

  // Initialize state with earliest exam month or current date if no exams
  const [currentDate, setCurrentDate] = useState(defaultDate);

  // Update current date when user subjects change
  useEffect(() => {
    setCurrentDate(getEarliestRelevantExamDate(userSubjects));
  }, [userSubjects]);

  return {
    currentDate,
    setCurrentDate,
    nextExamSession: getNextExamSession(),
  };
}