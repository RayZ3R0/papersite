export interface Unit {
  id: string;
  name: string;
  order: number;
  description?: string;
}

export interface Paper {
  id: string;
  unitId: string;  // Changed from unit to unitId to match JSON structure
  year: number;
  session: string;
  pdfUrl: string;
  markingSchemeUrl: string;
  title: string;
  subject?: string;  // Made optional as it's added dynamically
}

export interface Subject {
  id: string;
  name: string;
  units: Unit[];
  papers: Paper[];
}

export interface SubjectsData {
  subjects: {
    [key: string]: Subject;
  };
}

export type Session = 'January' | 'June' | 'October';

export interface SearchFilters {
  subject?: string;
  unit?: string;
  year?: number;
  session?: Session;
}