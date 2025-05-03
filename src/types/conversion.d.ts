export interface ConversionMetadata {
  qualificationType: string;
  session: string;
  subject: string;
  unit: string;
  recordCount: number;
  timestamp: string;
}

export interface ConversionRecord {
  RAW: number;
  UMS: number;
  GRADE: string;
}

export interface ConversionData {
  metadata: ConversionMetadata;
  data: ConversionRecord[];
}

export interface UnitConversion {
  unitId: string;
  unitName: string;
  sessions: {
    [key: string]: ConversionData;
  };
}

export interface SubjectConversions {
  [subjectId: string]: {
    [unitId: string]: UnitConversion;
  };
}