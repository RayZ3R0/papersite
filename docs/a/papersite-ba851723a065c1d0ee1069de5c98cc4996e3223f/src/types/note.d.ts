export interface Resource {
  id: string;
  title: string;
  type: 'pdf';
  downloadUrl: string;
  previewImage?: string;
  tags?: string[];
  dateAdded?: string;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  resources: Resource[];
}

export interface Unit {
  id: string;
  name: string;
  number: number;
  description?: string;
  unitPdf?: Resource;  // Optional complete unit PDF
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  units: Unit[];
}

export interface NotesData {
  subjects: Subject[];
}