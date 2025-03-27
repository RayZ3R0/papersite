export interface Book {
  id: string;
  title: string;
  imageUrl?: string;
  pdfUrl: string;
  solutionUrl?: string;
  subject: string;
}

export type Books = Book[];

export interface SubjectFilter {
  label: string;
  value: string;
  count: number;
}

export type SubjectFilters = SubjectFilter[];