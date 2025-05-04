import { PredictionResult } from './prediction';

export interface ConversionMetadata {
  qualificationType: string;
  session: string;
  subject: string;
  unit: string;
  recordCount: number;
  timestamp: string;
  hasGradePredictions?: boolean;
}

export interface ConversionRecord {
  RAW: number;
  UMS: number;
  GRADE: string;
  predictionConfidence?: number;  // Confidence score for predicted grades
}

export interface ConversionData {
  metadata: ConversionMetadata;
  data: ConversionRecord[];
  predictions?: {
    nextSession: string;
    results: Array<{
      grade: string;
      prediction: PredictionResult;
    }>;
  };
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

// Extended types for prediction-enabled conversion interfaces
export interface PredictionEnabledConversion extends UnitConversion {
  predictions: {
    history: Array<{
      session: string;
      boundaries: Array<{
        grade: string;
        raw: number;
        ums: number;
      }>;
    }>;
    forecast: Array<{
      session: string;
      predictions: Array<{
        grade: string;
        raw: PredictionResult;
        ums: PredictionResult;
      }>;
    }>;
  };
}

export interface PredictionStats {
  accuracy: number;          // Historical prediction accuracy (0-1)
  confidenceLevel: number;   // Overall confidence in predictions (0-1)
  dataPoints: number;        // Number of historical points used
  lastUpdated: string;       // Timestamp of last prediction update
}

export interface SubjectPredictionMetadata {
  [subjectId: string]: {
    [unitId: string]: PredictionStats;
  };
}