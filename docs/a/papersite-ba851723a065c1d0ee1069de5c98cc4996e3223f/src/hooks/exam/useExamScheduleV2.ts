'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Examination, ExamState } from '@/types/exam';
import { UserSubjectConfig } from '@/types/profile';
import { registrationSubjects } from '@/components/auth/registration/subjectData';
import routineData from '@/lib/data/routine.json';
import { parseISO, format } from 'date-fns';

// Cast examination data and add types
const typedExaminations = routineData.examinations.map(exam => ({
  ...exam,
  time: exam.time as "Morning" | "Afternoon"
}));

// Helper function to normalize exam codes for comparison
const normalizeCode = (code: string): string => {
  // Convert Y prefix to W (e.g., YBI11 -> WBI11)
  return code.startsWith('Y') ? 'W' + code.slice(1) : code;
};

// Registration subject types
interface RegistrationUnit {
  id: string;
  name: string;
  description: string;
}

interface RegistrationSubject {
  code: string;
  name: string;
  type: string;
  category: string;
  units: RegistrationUnit[];
}

// Helper function to find registration subject for an exam subject
const findRegSubject = (exam: Examination): RegistrationSubject | null => {
  if (process.env.NODE_ENV === 'development') {
    console.log('\nFinding registration subject for:', {
      examCode: exam.code,
      examSubject: exam.subject
    });
  }

  // Look for exact subject name match
  const regSubject = Object.values(registrationSubjects).find(s => {
    const matches = s.name === exam.subject;
    if (process.env.NODE_ENV === 'development') {
      console.log('Checking:', {
        regSubjectCode: s.code,
        regSubjectName: s.name,
        matches
      });
    }
    return matches;
  });

  if (process.env.NODE_ENV === 'development') {
    if (regSubject) {
      console.log('✅ Found registration subject:', {
        code: regSubject.code,
        name: regSubject.name,
        hasMatchingUnit: regSubject.units.some((u: RegistrationUnit) => {
          const matches = normalizeCode(u.id) === normalizeCode(exam.code);
          if (process.env.NODE_ENV === 'development' && matches) {
            console.log('Found matching unit:', {
              unitId: u.id,
              unitName: u.name,
              normalizedUnit: normalizeCode(u.id),
              normalizedExam: normalizeCode(exam.code)
            });
          }
          return matches;
        })
      });
    } else {
      console.log('❌ No registration subject found');
      console.log('Available subjects:', Object.values(registrationSubjects)
        .map(s => `${s.code} (${s.name})`));
    }
  }

  return regSubject || null;
};

// Helper function to check if unit matches exam
const isUnitRelevant = (exam: Examination, unit: { unitCode: string; examSession: string }): boolean => {
  // Get registration subject
  const regSubject = findRegSubject(exam);
  if (!regSubject) return false;

  // Find matching unit in registration data
  const isMatch = regSubject.units.some((regUnit: RegistrationUnit) => {
    const normalizedExamCode = normalizeCode(exam.code);
    const normalizedRegistrationCode = normalizeCode(regUnit.id);
    const normalizedUnitCode = normalizeCode(unit.unitCode);
    
    const matches = normalizedRegistrationCode === normalizedUnitCode &&
                   normalizedRegistrationCode === normalizedExamCode;

    if (process.env.NODE_ENV === 'development' && matches) {
      console.log('✅ Found unit match:', {
        exam: {
          code: exam.code,
          subject: exam.subject,
          normalized: normalizedExamCode
        },
        regUnit: {
          id: regUnit.id,
          normalized: normalizedRegistrationCode,
          name: regUnit.name
        },
        userUnit: {
          code: unit.unitCode,
          normalized: normalizedUnitCode,
          session: unit.examSession
        }
      });
    }

    return matches;
  });

  return isMatch;
};

// Helper function to check if an exam is relevant for a user
const isExamRelevant = (exam: Examination, userSubjects: UserSubjectConfig[]): boolean => {
  if (!userSubjects) return false;

  // Check each subject's units
  const hasMatchingUnit = userSubjects.some(subject =>
    subject.units.some(unit => isUnitRelevant(exam, unit))
  );

  if (process.env.NODE_ENV === 'development') {
    if (hasMatchingUnit) {
      const matchingInfo = userSubjects
        .filter(s => s.units.some(u => isUnitRelevant(exam, u)))
        .map(s => {
          const regSubject = registrationSubjects[s.subjectCode];
          const matchingUnits = s.units.filter(u => isUnitRelevant(exam, u));
          
          return {
            userSubject: {
              code: s.subjectCode,
              name: regSubject?.name
            },
            units: matchingUnits.map(u => ({
              code: u.unitCode,
              normalized: normalizeCode(u.unitCode),
              session: u.examSession,
              examMatch: {
                code: exam.code,
                normalized: normalizeCode(exam.code),
                subject: exam.subject
              }
            }))
          };
        });

      console.log('🎯 Found relevant exam:', {
        exam: {
          code: exam.code,
          subject: exam.subject,
          date: exam.date,
          time: exam.time
        },
        matchingSubjects: matchingInfo
      });
    } else {
      console.log('❌ Not relevant:', {
        exam: {
          code: exam.code,
          subject: exam.subject,
          normalized: normalizeCode(exam.code)
        },
        reason: 'No matching units in user subjects'
      });
    }
  }

  return hasMatchingUnit;
};

// Helper function to get next exam month - prioritizes user's exams
const getNextExamMonth = (userSubjects?: UserSubjectConfig[]): Date => {
  const now = new Date();

  if (userSubjects?.length) {
    // First try to find next relevant exam date
    const nextRelevantExamDate = typedExaminations
      .filter(exam => {
        const isRelevantExam = isExamRelevant(exam, userSubjects);
        const isFutureExam = parseISO(exam.date) > now;
        return isRelevantExam && isFutureExam;
      })
      .map(exam => parseISO(exam.date))
      .sort((a, b) => a.getTime() - b.getTime())[0];

    if (nextRelevantExamDate) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Found next relevant exam month:', format(nextRelevantExamDate, 'MMMM yyyy'));
      }
      return nextRelevantExamDate;
    }
  }

  // Fallback to next chronological exam if no relevant ones found
  const nextExamDate = typedExaminations
    .filter(exam => parseISO(exam.date) > now)
    .map(exam => parseISO(exam.date))
    .sort((a, b) => a.getTime() - b.getTime())[0];

  if (process.env.NODE_ENV === 'development') {
    console.log('Using fallback exam month:', format(nextExamDate || now, 'MMMM yyyy'));
  }

  return nextExamDate || now;
};

// Find relevant upcoming exams for countdown
const findRelevantExams = (exams: Examination[], userSubjects: UserSubjectConfig[]): Examination[] => {
  if (!userSubjects) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Finding next exam: No user subjects, showing all exams');
    }
    return [];
  }

  const now = new Date();
  const futureExams = exams
    .filter(exam => parseISO(exam.date) > now)
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  
  if (process.env.NODE_ENV === 'development') {
    console.log('\n==== Finding Next Exam ====');
    console.log(`Found ${futureExams.length} future exams`);
  }

  const relevantExams = futureExams.filter(exam => {
    const isRelevant = isExamRelevant(exam, userSubjects);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Checking future exam: ${exam.code} (${exam.subject})`, {
        date: format(parseISO(exam.date), 'dd MMM yyyy'),
        isRelevant,
        matchingUnits: isRelevant ? userSubjects
          .flatMap(s => s.units)
          .filter(u => isUnitRelevant(exam, u))
          .map(u => u.unitCode) : []
      });
    }
    
    return isRelevant;
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`Found ${relevantExams.length} relevant future exams`);
    if (relevantExams.length > 0) {
      console.log('Next exam:', {
        code: relevantExams[0].code,
        subject: relevantExams[0].subject,
        date: format(parseISO(relevantExams[0].date), 'dd MMM yyyy')
      });
    }
    console.log('=======================\n');
  }

  return relevantExams;
};

export function useExamScheduleV2() {
  const { data: profile, isLoading } = useProfile();
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

  // Debug profile data
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (isLoading) {
        console.log('Loading profile data...');
        return;
      }

      console.log('\n==== Profile State ====');
      if (!profile) {
        console.log('No profile data available');
      } else {
        console.log('Profile loaded:', {
          hasSubjects: !!profile.subjects,
          subjectCount: profile.subjects?.length,
          subjects: profile.subjects?.map(s => ({
            code: s.subjectCode,
            name: registrationSubjects[s.subjectCode]?.name,
            unitCount: s.units.length,
            units: s.units.map(u => ({
              code: u.unitCode,
              normalized: normalizeCode(u.unitCode),
              registered: registrationSubjects[s.subjectCode]?.units
                .some((ru: RegistrationUnit) => normalizeCode(ru.id) === normalizeCode(u.unitCode)) || false,
              registrationUnit: registrationSubjects[s.subjectCode]?.units
                .find((ru: RegistrationUnit) => normalizeCode(ru.id) === normalizeCode(u.unitCode))?.name || null
            }))
          })),
          examSessions: Array.from(new Set(profile.subjects?.flatMap(s =>
            s.units.map(u => u.examSession)
          ))).sort()
        });
      }
      console.log('====================\n');
    }
  }, [profile, isLoading]);

  // Mark all relevant exams based on user's subjects
  useEffect(() => {
    if (!profile?.subjects) {
      if (process.env.NODE_ENV === 'development') {
        console.log('No subjects found in profile');
      }
      setExaminations(typedExaminations.map(exam => ({ ...exam, isRelevant: false })));
      return;
    }

    // Detailed debug logging for exam matching
    if (process.env.NODE_ENV === 'development') {
      console.log('\n==== Begin Exam Matching ====');
      
      // Log user's subjects and units
      console.log('User\'s subjects:', profile.subjects.map(s => {
        const regSubject = registrationSubjects[s.subjectCode];
        return {
          code: s.subjectCode,
          name: regSubject?.name,
          units: s.units.map(u => ({
            code: u.unitCode,
            normalized: normalizeCode(u.unitCode),
            session: u.examSession,
            registrationMatch: regSubject?.units.find((ru: { id: string; name: string }) =>
              normalizeCode(ru.id) === normalizeCode(u.unitCode)
            )?.name || null
          }))
        };
      }));

      // Log available exams
      console.log('\nAvailable exams:', typedExaminations.map(e => ({
        code: e.code,
        normalized: normalizeCode(e.code),
        subject: e.subject,
        registrationSubject: findRegSubject(e)?.name
      })));

      console.log('=======================\n');
    }

    // Debug exam matching logic
    if (process.env.NODE_ENV === 'development') {
      console.log('\n==== Matching Logic Debug ====');
      // Log registration subjects
      console.log('Registration subjects:', Object.entries(registrationSubjects).map(([code, subject]: [string, RegistrationSubject]) => ({
        code,
        name: subject.name,
        units: subject.units.map((u: RegistrationUnit) => ({
          id: u.id,
          normalized: normalizeCode(u.id),
          name: u.name
        }))
      })));

      // Log exam subject mappings
      console.log('\nExam subject mappings:', typedExaminations.map(e => {
        const regSubject = findRegSubject(e);
        return {
          examCode: e.code,
          examSubject: e.subject,
          normalizedCode: normalizeCode(e.code),
          foundMapping: !!regSubject,
          mappedTo: regSubject ? {
            code: regSubject.code,
            name: regSubject.name,
            matchingUnits: regSubject.units
              .filter(u => normalizeCode(u.id) === normalizeCode(e.code))
              .map(u => u.id)
          } : null
        };
      }));
      console.log('=======================\n');
    }

    const updatedExams = typedExaminations.map(exam => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`\nChecking exam: ${exam.code} (${exam.subject})`);
      }

      const matchingUnits = profile.subjects
        .flatMap(s => s.units)
        .filter(u => isUnitRelevant(exam, u));
      
      const relevant = matchingUnits.length > 0;

      if (process.env.NODE_ENV === 'development') {
        if (relevant) {
          console.log('✅ Exam is relevant:', {
            exam: {
              code: exam.code,
              normalized: normalizeCode(exam.code),
              subject: exam.subject,
              date: exam.date
            },
            matchingUnits: matchingUnits.map(u => ({
              code: u.unitCode,
              normalized: normalizeCode(u.unitCode),
              session: u.examSession
            }))
          });
        } else {
          console.log('❌ Exam not relevant:', {
            code: exam.code,
            normalized: normalizeCode(exam.code),
            subject: exam.subject,
            reason: 'No matching units found'
          });
        }
      }

      return { ...exam, isRelevant: relevant };
    });

    setExaminations(updatedExams);

    // Log summary with details
    if (process.env.NODE_ENV === 'development') {
      const relevantExams = updatedExams.filter(e => e.isRelevant);
      console.log('\n==== Matching Summary ====');
      console.log(`Found ${relevantExams.length} relevant exams out of ${updatedExams.length} total`);
      
      if (relevantExams.length > 0) {
        console.log('Relevant Exams:', relevantExams.map(e => ({
          code: e.code,
          subject: e.subject,
          date: e.date,
          matchingUnits: profile.subjects
            .flatMap(s => s.units)
            .filter(u => isUnitRelevant(e, u))
            .map(u => u.unitCode)
        })));
      }
      console.log('=======================\n');
    }
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

  // Get the next exam month for calendar default - prioritize user's exams
  const nextExamMonth = useMemo(() => getNextExamMonth(profile?.subjects), [profile?.subjects]);

  // Get calendar month status message
  const monthStatus = useMemo(() => {
    if (!profile?.subjects) {
      return "Showing all upcoming exams";
    }

    const month = format(nextExamMonth, 'MMMM yyyy');
    
    // Find if there are any relevant exams in the selected month
    const hasRelevantExamsInMonth = examinations
      .filter(e => format(parseISO(e.date), 'MMMM yyyy') === month)
      .some(e => e.isRelevant);

    if (hasRelevantExamsInMonth) {
      return `Showing your next exam month: ${month}`;
    }

    return `No exams found in your schedule - showing all exams for ${month}`;
  }, [nextExamMonth, examinations, profile?.subjects]);

  return {
    examinations: filteredExams,
    nextExam,
    subjects,
    state,
    setState,
    view: state.view,
    nextExamMonth,
    monthStatus // Add status message to return value
  };
}