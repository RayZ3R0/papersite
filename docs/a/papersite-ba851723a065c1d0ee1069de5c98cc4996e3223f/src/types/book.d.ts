export interface Book {
  id: string;
  title: string;
  subject?: string;
  grade?: string;
  year?: number;
  term?: string;
  edition?: string;
  language?: string;
  coverImage?: string;
  imageUrl?: string; // For backward compatibility
  description?: string;
  downloadUrl?: string;
  pdfUrl?: string; // For backward compatibility
  solutionUrl?: string;
  tags?: string[];
  publisher?: string;
  authors?: string[];
  isbn?: string;
  pages?: number;
}