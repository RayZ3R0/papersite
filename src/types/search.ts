import { Paper, Unit, Subject } from './subject';

export interface SearchQuery {
  text: string;
  subject?: string;
  unit?: string;
  unitArray?: string[]; // Add unitArray property
  year?: number;
  session?: string;
  sessionArray?: string[]; // Add sessionArray property
  type?: 'MCQ' | 'Written';
}

export interface SearchResult {
  paper: Paper;
  unit: Unit;
  subject: Subject;
  score: number;
  matches: {
    text?: boolean;
    subject?: boolean;
    unit?: boolean;
    year?: boolean;
    session?: boolean;
    type?: boolean;
  };
}

export interface SearchSuggestion {
  type: 'subject' | 'unit' | 'year' | 'session' | 'refinement' | 'info'; // Add 'info' type
  text: string;
  value: string;
  score: number;
}