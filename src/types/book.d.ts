export interface Book {
  id: string;
  title: string;
  subject?: string;
  grade?: string;
  year?: number;
  term?: string;
  edition?: string;
  language?: string;
  coverImage: string;
  description?: string;
  downloadUrl?: string;
  tags?: string[];
  publisher?: string;
  authors?: string[];
  isbn?: string;
  pages?: number;
}