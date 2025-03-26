export interface Paper {
  id: string;
  unitId: string;
  year: number;
  session: string;
  pdfUrl: string;
  markingSchemeUrl: string;
  title: string;
}

export interface Unit {
  id: string;
  name: string;
  order: number;
  description?: string;
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