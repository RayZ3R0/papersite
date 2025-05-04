export interface Subject {
  id: string;
  name: string;
  code: string;
  units?: Unit[];
}

export interface Unit {
  id: string;
  name: string;
  code: string;
  description?: string;
  subjectId: string;
}

export interface UMSData {
  unit_id: string;
  unit_name: string;
  total_papers_found: number;
  sessions: {
    session: string;
    metadata: {
      qualificationType: string;
      session: string;
      subject: string;
      unit: string;
      recordCount: number;
      timestamp: string;
    };
    data: Array<{
      RAW: number;
      UMS: number;
      GRADE: string;
    }>;
  }[];
}