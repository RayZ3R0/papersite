export interface Paper {
  id: string;
  unit_id: string;
  unit_code: string;
  year: number;
  session: string;
  pdf_url: string;
  marking_scheme_url: string;
  title: string;
  subject_name?: string; 
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
