'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Examination, ExamState } from '@/types/exam';
import routineData from '@/lib/data/routine.json';

// Cast the examinations data to ensure proper typing
const typedExaminations = routineData.examinations.map(exam => ({
  ...exam,
  time: exam.time as "Morning" | "Afternoon"
}));

export function useExamSchedule() {
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

  // Mark relevant exams based on user's subjects
  useEffect(() => {
    if (!profile?.subjects) return;

    const userSubjects = profile.subjects.map(s => s.subjectCode);
    const updatedExams = typedExaminations.map(exam => ({
      ...exam,
      isRelevant: userSubjects.includes(exam.subject)
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
      if (state.filters.dateRange.start && new Date(exam.date) < new Date(state.filters.dateRange.start)) {
        return false;
      }
      if (state.filters.dateRange.end && new Date(exam.date) > new Date(state.filters.dateRange.end)) {
        return false;
      }

      // Time filter
      if (state.filters.time.length > 0 && !state.filters.time.includes(exam.time)) {
        return false;
      }

      return true;
    });
  }, [examinations, state.filters]);

  // Get the next upcoming exam
  const nextExam = useMemo(() => {
    const now = new Date();
    return filteredExams
      .filter(exam => new Date(exam.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [filteredExams]);

  // Get unique subjects for filter options
  const subjects = useMemo(() => {
    return Array.from(new Set(examinations.map(exam => exam.subject)));
  }, [examinations]);

  return {
    examinations: filteredExams,
    nextExam,
    subjects,
    state,
    setState,
    view: state.view
  };
}

// Helper function to calculate days until exam
export function getDaysUntil(date: string): number {
  const examDate = new Date(date);
  const now = new Date();
  const diffTime = examDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Format exam duration for display
export function formatDuration(duration: string): string {
  const [hours, minutes] = duration.split('h ').map(part => parseInt(part));
  if (minutes) {
    return `${hours}h ${minutes}m`;
  }
  return `${hours}h`;
}
