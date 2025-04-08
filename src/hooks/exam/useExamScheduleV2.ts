'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Examination, ExamState } from '@/types/exam';
import { UserSubjectConfig, UserUnit } from '@/types/profile';
import routineData from '@/lib/data/routine.json';
import { parseISO, format } from 'date-fns';

const typedExaminations = routineData.examinations.map(exam => ({
  ...exam,
  time: exam.time as "Morning" | "Afternoon"
}));

// Helper function to get month and year from date
const getMonthYear = (date: string): string => {
  return format(parseISO(date), "MMMM yyyy");
};

// Helper function to check if a unit matches the exam period
const isMatchingPeriod = (unitSession: string, examMonthYear: string) => {
  // Handle May/June overlap
  if (examMonthYear === "May 2025") {
    return unitSession === "May 2025" || unitSession === "June 2025";
  }
  if (examMonthYear === "June 2025") {
    return unitSession === "May 2025" || unitSession === "June 2025";
  }
  // For other months, require exact match
  return unitSession === examMonthYear;
};

// Helper function to find all matching user units for an exam
const findMatchingUnits = (exam: Examination, userSubjects: UserSubjectConfig[]): UserUnit[] => {
  const matches: UserUnit[] = [];
  const examMonthYear = getMonthYear(exam.date);

  for (const subject of userSubjects) {
    for (const unit of subject.units) {
      // Check code match
      const codeMatches = exam.code === unit.unitCode;
      
      // Check session match if code matches
      if (codeMatches && isMatchingPeriod(unit.examSession, examMonthYear)) {
        matches.push(unit);
      }
    }
  }

  return matches;
};

// Helper function to check if an exam is relevant for a user's subjects
const isExamRelevant = (exam: Examination, userSubjects: UserSubjectConfig[]): boolean => {
  if (!userSubjects) return false;
  return findMatchingUnits(exam, userSubjects).length > 0;
};

// Helper function to get next exam month
const getNextExamMonth = (): Date => {
  const now = new Date();
  const nextExamDate = typedExaminations
    .filter(exam => parseISO(exam.date) > now)
    .map(exam => parseISO(exam.date))
    .sort((a, b) => a.getTime() - b.getTime())[0];

  return nextExamDate || now;
};

// Helper function to find all relevant upcoming exams for the user
const findRelevantExams = (exams: Examination[], userSubjects: UserSubjectConfig[]): Examination[] => {
  if (!userSubjects) return [];
  
  const now = new Date();
  const futureExams = exams
    .filter(exam => parseISO(exam.date) > now)
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  return futureExams.filter(exam => findMatchingUnits(exam, userSubjects).length > 0);
};

export function useExamScheduleV2() {
  const { data: profile } = useProfile();
  const [examinations, setExaminations] = useState<Examination[]>(typedExaminations);
  const [state, setState] = useState<ExamState>({
    view: 'calendar',
    filters: {
      subjects: [],
      dateRange: {
        start: null,
        end: null
      },
      time: []
    }
  });

  // Mark all relevant exams based on user's subjects
  useEffect(() => {
    const updatedExams = typedExaminations.map(exam => ({
      ...exam,
      isRelevant: profile?.subjects ? isExamRelevant(exam, profile.subjects) : false
    }));

    setExaminations(updatedExams);
  }, [profile?.subjects]);

  // Filter exams based on current state
  const filteredExams = useMemo(() => {
    return examinations.filter(exam => {
      // Subject filter
      if (state.filters.subjects.length > 0 && !state.filters.subjects.includes(exam.subject)) {
        return false;
      }

      // Date range filter
      if (state.filters.dateRange.start && parseISO(exam.date) < parseISO(state.filters.dateRange.start)) {
        return false;
      }
      if (state.filters.dateRange.end && parseISO(exam.date) > parseISO(state.filters.dateRange.end)) {
        return false;
      }

      // Time filter
      if (state.filters.time.length > 0 && !state.filters.time.includes(exam.time)) {
        return false;
      }

      return true;
    });
  }, [examinations, state.filters]);

  // Get the next upcoming exam - prioritize relevant exams
  const nextExam = useMemo(() => {
    if (profile?.subjects) {
      const relevantExams = findRelevantExams(examinations, profile.subjects);
      if (relevantExams.length > 0) {
        return relevantExams[0];
      }
    }

    // Fallback to next chronological exam if no relevant exam found
    const now = new Date();
    return examinations
      .filter(exam => parseISO(exam.date) > now)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())[0] || null;
  }, [examinations, profile?.subjects]);

  // Get unique subjects for filter options
  const subjects = useMemo(() => {
    return Array.from(new Set(examinations.map(exam => exam.subject)));
  }, [examinations]);

  // Get the next exam month for calendar default
  const nextExamMonth = useMemo(() => getNextExamMonth(), []);

  return {
    examinations: filteredExams,
    nextExam,
    subjects,
    state,
    setState,
    view: state.view,
    nextExamMonth
  };
}