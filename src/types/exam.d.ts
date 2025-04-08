import { UserSubjectConfig } from "./profile";

export interface Examination {
  subject: string;
  code: string;
  title: string;
  date: string;
  day: string;
  time: "Morning" | "Afternoon";
  duration: string;
  isRelevant?: boolean;
}

export interface ExamData {
  title: string;
  examinations: Examination[];
}

export interface ExamState {
  view: 'calendar' | 'list';
  filters: {
    subjects: string[];
    dateRange: {
      start: string | null;
      end: string | null;
    };
    time: string[];
  };
}

export interface CalendarViewProps {
  examinations: Examination[];
  userSubjects?: UserSubjectConfig[];
  onDateSelect?: (date: string) => void;
  className?: string;
}

export interface DayCellProps {
  date: Date;
  exams: Examination[];
  isSelected?: boolean;
  isToday?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface CountdownTimerProps {
  targetDate: string;
  title: string;
  className?: string;
}

export interface ExamListProps {
  examinations: Examination[];
  userSubjects?: UserSubjectConfig[];
  className?: string;
  view?: 'compact' | 'detailed';
}

export interface ExamFilterProps {
  state: ExamState;
  onChange: (state: ExamState) => void;
  subjects: string[];
  className?: string;
}
