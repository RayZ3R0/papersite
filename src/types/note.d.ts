export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'folder';
  downloadUrl?: string;  // Optional for folders
  previewImage?: string;
  tags?: string[];
  dateAdded?: string;
  items?: Resource[];    // For folders, contains nested resources
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
  unitPdf?: Resource;  // Optional complete unit PDF (can now be a folder)
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  units: Unit[];
  resources?: Resource[]; // Subject-level resources, not tied to any unit
}

export interface NotesData {
  subjects: Subject[];
}