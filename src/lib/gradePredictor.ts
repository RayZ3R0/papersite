/**
 * Grade Boundary Prediction Utility
 * 
 * This module implements statistical analysis methods for predicting future grade boundaries
 * based on historical data patterns. It uses various statistical techniques including:
 * - Time series analysis for detecting long-term trends
 * - Seasonal decomposition for identifying cyclical patterns
 * - Weighted moving averages for smoothing noisy data
 * - Statistical regression for trend modeling
 * - Confidence interval calculations for prediction accuracy
 */

// Types for historical grade boundary data
export interface GradeBoundary {
    grade: string;           // A*, A, B, etc.
    marks: number;          // Raw marks required
    session: string;        // Exam session (e.g., "Jun 2024")
    paper: string;         // Paper code
}

interface SeasonalPattern {
    winter: number;        // Winter session adjustment
    summer: number;        // Summer session adjustment
    strength: number;      // Strength of seasonal effect (0-1)
}

interface TrendAnalysis {
    slope: number;         // Rate of change over time
    intercept: number;     // Baseline value
    rSquared: number;     // Goodness of fit (0-1)
}

interface PredictionResult {
    predictedBoundary: number;
    confidence: {
        lower: number;     // Lower bound of confidence interval
        upper: number;     // Upper bound of confidence interval
        level: number;     // Confidence level (e.g., 0.95 for 95%)
    };
    trend: TrendAnalysis;
    seasonality?: SeasonalPattern;
}

/**
 * Analyzes historical grade boundaries to identify patterns and trends
 * Uses linear regression and moving averages to detect long-term changes
 */
export function analyzeHistoricalTrends(
    history: GradeBoundary[],
    grade: string
): TrendAnalysis {
    // Filter history for the specific grade
    const gradeHistory = history.filter(h => h.grade === grade);
    
    // Check if we have enough data points
    if (gradeHistory.length < 2) {
        return {
            slope: 0,
            intercept: gradeHistory.length > 0 ? gradeHistory[0].marks : 0,
            rSquared: 0
        };
    }
    
    // Convert dates to numerical values for regression
    const timePoints = gradeHistory.map((_, i) => i);
    const boundaries = gradeHistory.map(h => h.marks);
    
    // Calculate linear regression
    const n = timePoints.length;
    const sumX = timePoints.reduce((a, b) => a + b, 0);
    const sumY = boundaries.reduce((a, b) => a + b, 0);
    const sumXY = timePoints.reduce((a, x, i) => a + x * boundaries[i], 0);
    const sumXX = timePoints.reduce((a, x) => a + x * x, 0);
    
    // Avoid division by zero
    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) {
        return {
            slope: 0,
            intercept: sumY / n,
            rSquared: 0
        };
    }
    
    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const totalSS = boundaries.reduce((a, y) => a + Math.pow(y - yMean, 2), 0);
    if (totalSS === 0) {
        return {
            slope: 0,
            intercept: yMean,
            rSquared: 1 // Perfect fit for constant values
        };
    }
    
    const regressionSS = boundaries.reduce((a, y, i) => {
        const predicted = slope * timePoints[i] + intercept;
        return a + Math.pow(predicted - yMean, 2);
    }, 0);
    
    return {
        slope,
        intercept,
        rSquared: regressionSS / totalSS
    };
}

/**
 * Identifies seasonal variations in grade boundaries between exam sessions
 * Uses decomposition to separate seasonal effects from overall trend
 */
export function detectSeasonality(
    history: GradeBoundary[]
): SeasonalPattern {
    if (history.length < 2) {
        return {
            winter: 0,
            summer: 0,
            strength: 0
        };
    }
    
    // Group boundaries by season
    const winterSessions = history.filter(h => h.session.includes('Jan'));
    const summerSessions = history.filter(h => h.session.includes('Jun'));
    
    // Handle cases where we don't have both seasons
    if (winterSessions.length === 0 || summerSessions.length === 0) {
        return {
            winter: 0,
            summer: 0,
            strength: 0
        };
    }
    
    // Calculate average differences
    const winterMean = winterSessions.reduce((a, b) => a + b.marks, 0) / winterSessions.length;
    const summerMean = summerSessions.reduce((a, b) => a + b.marks, 0) / summerSessions.length;
    const overallMean = history.reduce((a, b) => a + b.marks, 0) / history.length;
    
    // Calculate relative seasonal effects
    const winterEffect = winterMean - overallMean;
    const summerEffect = summerMean - overallMean;
    
    // Calculate strength of seasonality
    const totalVariance = history.reduce((a, b) => a + Math.pow(b.marks - overallMean, 2), 0);
    
    // Avoid division by zero
    if (totalVariance === 0) {
        return {
            winter: 0,
            summer: 0,
            strength: 0
        };
    }
    
    const seasonalVariance = 
        winterSessions.reduce((a, b) => a + Math.pow(b.marks - winterMean, 2), 0) +
        summerSessions.reduce((a, b) => a + Math.pow(b.marks - summerMean, 2), 0);
    
    const strength = Math.max(0, Math.min(1, 1 - (seasonalVariance / totalVariance)));
    
    return {
        winter: winterEffect,
        summer: summerEffect,
        strength
    };
}

/**
 * Generates predictions for next session's grade boundaries
 * Combines trend analysis, seasonality, and historical patterns
 */
export function predictNextBoundaries(
    history: GradeBoundary[],
    grade: string,
    targetSession: string
): PredictionResult {
    // Handle empty data
    if (history.length === 0) {
        return {
            predictedBoundary: 0,
            confidence: {
                lower: 0,
                upper: 0,
                level: 0.95
            },
            trend: { slope: 0, intercept: 0, rSquared: 0 }
        };
    }
    
    // Filter history for the specific grade
    const gradeHistory = history.filter(h => h.grade === grade);
    
    // If no history for this grade, use average of all grades
    if (gradeHistory.length === 0) {
        const averageMark = Math.round(
            history.reduce((sum, item) => sum + item.marks, 0) / history.length
        );
        return {
            predictedBoundary: averageMark,
            confidence: {
                lower: Math.max(0, averageMark - 10),
                upper: averageMark + 10,
                level: 0.5
            },
            trend: { slope: 0, intercept: averageMark, rSquared: 0 }
        };
    }
    
    // Get trend analysis
    const trend = analyzeHistoricalTrends(history, grade);
    
    // Get seasonality pattern (if we have enough data)
    const seasonality = history.length >= 3 ? detectSeasonality(history) : { winter: 0, summer: 0, strength: 0 };
    
    // Calculate base prediction from trend
    const nextTimePoint = gradeHistory.length;
    let basePrediction = trend.slope * nextTimePoint + trend.intercept;
    
    // Apply seasonal adjustment if we have seasonal data
    if (seasonality.strength > 0.2) {  // Only apply if seasonality is significant
        if (targetSession.includes('Jan')) {
            basePrediction += seasonality.winter;
        } else if (targetSession.includes('Jun')) {
            basePrediction += seasonality.summer;
        }
    }
    
    // Ensure prediction is reasonable (not negative)
    basePrediction = Math.max(0, basePrediction);
    
    // Calculate confidence interval
    const confidence = calculateConfidence(gradeHistory, trend, basePrediction);
    
    return {
        predictedBoundary: Math.round(basePrediction),
        confidence,
        trend,
        seasonality
    };
}

/**
 * Calculates confidence intervals for predictions
 * Uses standard error of regression and prediction interval formulas
 */
export function calculateConfidence(
    history: GradeBoundary[],
    trend: TrendAnalysis,
    prediction: number
): {lower: number; upper: number; level: number} {
    // Handle edge cases
    if (history.length < 3) {
        // Not enough data for confidence interval, provide a rough estimate
        const range = history.length > 0 ? Math.round(prediction * 0.1) : 10;
        return {
            lower: Math.max(0, Math.round(prediction - range)),
            upper: Math.round(prediction + range),
            level: 0.5
        };
    }
    
    const n = history.length;
    
    // Calculate standard error of regression
    const residuals = history.map((h, i) => 
        h.marks - (trend.slope * i + trend.intercept)
    );
    
    const sumSquaredResiduals = residuals.reduce((a, b) => a + b * b, 0);
    const standardError = Math.sqrt(sumSquaredResiduals / (n - 2));
    
    // Use 95% confidence level (t-value ≈ 2 for large sample sizes)
    const tValue = 2;
    
    // Calculate prediction interval width (simplified formula)
    const intervalWidth = tValue * standardError * Math.sqrt(1 + 1/n);
    
    return {
        lower: Math.max(0, Math.round(prediction - intervalWidth)),
        upper: Math.round(prediction + intervalWidth),
        level: 0.95
    };
}