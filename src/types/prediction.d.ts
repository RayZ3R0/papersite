/**
 * Type definitions for grade boundary prediction system
 * Contains interfaces and types for prediction parameters, results, and data transformations

*/


/**
 * Type definitions for improved grade boundary prediction system
 */

import { GradeBoundary } from "@/lib/gradePredictor";

// Enhanced trend analysis with stability metrics
export interface ImprovedTrendAnalysis {
  slope: number;         // Rate of change over time
  recentSlope: number;   // Recent trend (last few data points)
  overallDirection: number; // Normalized trend direction (-1 to 1)
  stability: number;     // Stability of the trend (0-1)
}

// Enhanced seasonal pattern detection
export interface ImprovedSeasonalPattern {
  winterEffect: number;  // Effect on winter session
  summerEffect: number;  // Effect on summer session
  strength: number;      // Strength/confidence of seasonal pattern (0-1)
}

// Enhanced confidence interval
export interface ImprovedConfidenceInterval {
  lower: number;         // Lower bound
  upper: number;         // Upper bound
  level: number;         // Confidence level (e.g. 0.95 for 95%)
}

// Complete prediction result
export interface ImprovedPredictionResult {
  grade: string;                        // Grade (A*, A, B, etc.)
  prediction: number;                   // Predicted boundary mark
  confidence: ImprovedConfidenceInterval; // Confidence interval
  trend: {
    slope: number;                      // Overall trend slope
    recent: number;                     // Recent trend
    overall: number;                    // Normalized trend direction
    stability: number;                  // Trend stability score
  };
  reliability: number;                  // Overall reliability score (0-1)
  seasonality?: {                      
    effect: number;                     // Session-specific effect
    strength: number;                   // Strength of seasonal pattern
  };
}

// Function signature for the prediction algorithm
export type PredictionFunction = (
  historicalData: GradeBoundary[],
  grades: string[],
  targetSession: string
) => ImprovedPredictionResult[];

// Core data structures
export interface GradeBoundary {
  grade: string;           // Grade level (A*, A, B, etc.)
  marks: number;          // Raw marks required
  session: string;        // Exam session identifier (e.g., "Jun 2024")
  paper: string;         // Paper/unit code
}

// Statistical analysis types
export interface TrendAnalysis {
  slope: number;         // Rate of change over time
  intercept: number;     // Baseline value (y-intercept)
  rSquared: number;      // Coefficient of determination (0-1)
}

export interface SeasonalPattern {
  winter: number;        // Winter session adjustment factor
  summer: number;        // Summer session adjustment factor
  strength: number;      // Seasonality strength coefficient (0-1)
}

// Confidence interval representation
export interface ConfidenceInterval {
  lower: number;         // Lower bound of interval
  upper: number;         // Upper bound of interval
  level: number;         // Confidence level (e.g., 0.95 for 95%)
}

// Prediction outputs
export interface PredictionResult {
  predictedBoundary: number;              // Predicted grade boundary
  confidence: ConfidenceInterval;         // Prediction confidence interval
  trend: TrendAnalysis;                  // Underlying trend analysis
  seasonality?: SeasonalPattern;         // Optional seasonal effects
}

// Input parameters for predictions
export interface PredictionParams {
  historicalData: GradeBoundary[];        // Historical grade boundaries
  targetGrade: string;                    // Grade to predict
  targetSession: string;                  // Session to predict for
}

// Utility types for data transformations
export type GradeLevel = 'A*' | 'A' | 'B' | 'C' | 'D' | 'E' | 'U';

export type SessionType = 'winter' | 'summer';

export interface TimeSeriesPoint {
  value: number;
  timestamp: string;
  grade: string;
}

// Component props types
export interface PredictionVisualizationProps {
  historicalData: GradeBoundary[];
  targetSession: string;
  grades: GradeLevel[];
  showConfidenceIntervals?: boolean;
  onPredictionUpdate?: (predictions: Array<{
    grade: string;
    prediction: number;
  }>) => void;
}

// API response types
export interface PredictionResponse {
  predictions: Array<{
    grade: string;
    prediction: PredictionResult;
  }>;
  metadata: {
    analysisTimestamp: string;
    dataPointsUsed: number;
    confidence: number;
  };
}

// Error types
export interface PredictionError {
  code: string;
  message: string;
  details?: {
    missingData?: string[];
    invalidValues?: string[];
    suggestions?: string[];
  };
}