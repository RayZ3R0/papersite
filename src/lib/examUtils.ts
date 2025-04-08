import { Examination } from '@/types/exam';
import routineData from './data/routine.json';

// Type guard to check if an exam time is valid
function isValidExamTime(time: string): time is "Morning" | "Afternoon" {
  return time === "Morning" || time === "Afternoon";
}

// Validate and type the exam data
export function getTypedExaminations(): Examination[] {
  return routineData.examinations.map(exam => {
    if (!isValidExamTime(exam.time)) {
      throw new Error(`Invalid exam time: ${exam.time} for exam ${exam.code}`);
    }

    return {
      ...exam,
      time: exam.time, // TypeScript will infer this as "Morning" | "Afternoon" due to type guard
      isRelevant: false, // Default value
    };
  });
}

// Get the examinations singleton
export const typedExaminations = getTypedExaminations();