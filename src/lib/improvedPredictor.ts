import { GradeBoundary } from "@/lib/gradePredictor";

/**
 * Enhanced prediction types with more detailed metrics
 */
export interface ImprovedPredictionResult {
  grade: string;
  prediction: number;
  confidence: {
    lower: number;
    upper: number;
    level: number;
  };
  trend: {
    slope: number;
    recent: number;
    overall: number;
    stability: number;
  };
  reliability: number; // 0-1 scale indicating prediction confidence
  seasonality: {
    effect: number;
    strength: number;
  };
}

/**
 * Check if data point is from June 2023 or later
 * These data points are given significantly higher weight
 */
function isRecentData(boundary: GradeBoundary): boolean {
  // Check if session contains 2023 or later
  const year = parseInt(boundary.session.split('_')[1], 10);
  return year >= 2023;
}

/**
 * Improved algorithm for predicting grade boundaries
 * Features:
 * - More robust trend detection
 * - Heavily weighted recent data (June 2023 onwards)
 * - Advanced seasonality analysis
 * - Outlier detection and handling
 * - Reliability metrics
 */
export function improvedPredictGradeBoundaries(
  historicalData: GradeBoundary[],
  grades: string[],
  targetSession: string
): ImprovedPredictionResult[] {
  if (!historicalData.length) return [];
  
  // Process each grade separately
  const results = grades
    .map(grade => {
      try {
        // Get data for this grade only
        const gradeData = historicalData.filter(d => d.grade === grade);
        
        // Need at least 2 data points to make a prediction
        if (gradeData.length < 2) {
          return null;
        }
        
        // Sort data chronologically
        const sortedData = [...gradeData].sort((a, b) => {
          // Extract year from session
          const yearA = parseInt(a.session.split('_')[1], 10);
          const yearB = parseInt(b.session.split('_')[1], 10);
          
          if (yearA !== yearB) return yearA - yearB;
          
          // Extract month
          const isJanuaryA = a.session.includes('January');
          const isJanuaryB = b.session.includes('January');
          
          if (isJanuaryA && !isJanuaryB) return -1;
          if (!isJanuaryA && isJanuaryB) return 1;
          
          return 0;
        });
        
        // Check if we have recent data (2023+)
        const hasRecentData = sortedData.some(isRecentData);
        
        // Calculate trend using weighted linear regression
        const trend = calculateWeightedTrend(sortedData);
        
        // Detect seasonality
        const seasonality = detectImprovedSeasonality(sortedData);
        
        // Calculate baseline prediction
        const recentAverage = calculateRecentAverage(sortedData);
        const trendPrediction = calculateTrendBasedPrediction(sortedData, trend);
        
        // Important: Weight recent data much more heavily
        let finalPrediction;
        
        if (hasRecentData) {
          // If we have recent data, give it much higher weight
          const recentOnlyData = sortedData.filter(isRecentData);
          const recentOnlyAverage = calculateAverage(recentOnlyData);
          
          // Use a strong weighting toward recent data (80% recent, 10% trend, 10% overall)
          finalPrediction = (
            recentOnlyAverage * 0.8 + 
            trendPrediction * 0.1 + 
            recentAverage * 0.1
          );
        } else {
          // If no recent data, use regular weighted combination
          finalPrediction = (
            trendPrediction * trend.stability +
            recentAverage * (1 - trend.stability)
          );
        }
        
        // Apply seasonal adjustment if applicable
        if (seasonality.strength > 0.3) {
          const targetIsWinter = targetSession.includes('January');
          finalPrediction += targetIsWinter 
            ? seasonality.winterEffect 
            : seasonality.summerEffect;
        }
        
        // Ensure prediction is within reasonable bounds
        finalPrediction = ensureReasonableBounds(finalPrediction, sortedData);
        
        // Calculate confidence interval (narrower if recent data available)
        const confidence = calculateImprovedConfidence(
          sortedData, 
          finalPrediction, 
          trend.stability,
          seasonality.strength,
          hasRecentData
        );
        
        // Calculate overall reliability score (0-1), boosted if recent data available
        const reliability = calculateReliability(
          sortedData.length,
          trend.stability,
          seasonality.strength,
          confidence.upper - confidence.lower,
          hasRecentData
        );
        
        // Return comprehensive prediction result
        return {
          grade,
          prediction: Math.round(finalPrediction),
          confidence,
          trend: {
            slope: trend.slope,
            recent: trend.recentSlope,
            overall: trend.overallDirection,
            stability: trend.stability
          },
          reliability,
          seasonality: {
            effect: targetSession.includes('January') ? 
              seasonality.winterEffect : seasonality.summerEffect,
            strength: seasonality.strength
          }
        };
      } catch (error) {
        console.error(`Error predicting for grade ${grade}:`, error);
        return null;
      }
    })
    .filter((result): result is ImprovedPredictionResult => result !== null);
    
  return results;
}

/**
 * Calculate weighted trend giving more importance to recent data
 */
function calculateWeightedTrend(data: GradeBoundary[]) {
  if (data.length < 2) {
    return {
      slope: 0,
      recentSlope: 0,
      overallDirection: 0,
      stability: 0
    };
  }
  
  // Assign weights to data points - much higher for recent data
  const weights = data.map(point => isRecentData(point) ? 5.0 : 1.0);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  // Convert to numerical time points
  const timePoints = data.map((_, i) => i);
  const marks = data.map(d => d.marks);
  
  // Calculate weighted mean of x and y
  let sumW = 0;
  let sumWX = 0;
  let sumWY = 0;
  let sumWXY = 0;
  let sumWXX = 0;

  for (let i = 0; i < data.length; i++) {
    const w = weights[i];
    const x = timePoints[i];
    const y = marks[i];
    
    sumW += w;
    sumWX += w * x;
    sumWY += w * y;
    sumWXY += w * x * y;
    sumWXX += w * x * x;
  }
  
  // Calculate weighted least squares regression
  const meanX = sumWX / sumW;
  const meanY = sumWY / sumW;
  
  // Check for division by zero
  const denominator = sumWXX - (sumWX * sumWX) / sumW;
  const slope = denominator === 0 ? 0 : (sumWXY - (sumWX * sumWY) / sumW) / denominator;
  
  // Calculate recent trend (last 3 points or all if less than 3)
  const recentPoints = data.slice(-Math.min(3, data.length));
  let recentSlope = 0;
  
  if (recentPoints.length >= 2) {
    const first = recentPoints[0];
    const last = recentPoints[recentPoints.length - 1];
    const timeDiff = recentPoints.length - 1;
    
    recentSlope = timeDiff === 0 ? 0 : (last.marks - first.marks) / timeDiff;
  }
  
  // Calculate overall direction (-1 to 1)
  const overallDirection = Math.max(-1, Math.min(1, slope / 5));
  
  // Calculate weighted trend stability
  const weightedResiduals = data.map((d, i) => {
    const predicted = slope * timePoints[i] + (meanY - slope * meanX);
    return weights[i] * Math.abs(d.marks - predicted);
  });
  
  const avgWeightedResidual = weightedResiduals.reduce((sum, r) => sum + r, 0) / sumW;
  const avgMark = sumWY / sumW;
  
  // Stability is higher when residuals are low relative to the average mark
  const stability = Math.max(0, Math.min(0.95, 1 - (avgWeightedResidual / avgMark) * 2));
  
  return {
    slope,
    recentSlope,
    overallDirection,
    stability
  };
}

/**
 * Calculate simple average of all data points
 */
function calculateAverage(data: GradeBoundary[]) {
  if (data.length === 0) return 0;
  return data.reduce((sum, d) => sum + d.marks, 0) / data.length;
}

/**
 * Improved detection of seasonal patterns in grade boundaries
 */
function detectImprovedSeasonality(data: GradeBoundary[]) {
  // Default values
  const result = {
    winterEffect: 0,
    summerEffect: 0,
    strength: 0
  };
  
  if (data.length < 3) {
    return result;
  }
  
  // Group by season
  const winterSessions = data.filter(d => d.session.includes('January'));
  const summerSessions = data.filter(d => d.session.includes('June'));
  
  // Need both winter and summer data
  if (winterSessions.length === 0 || summerSessions.length === 0) {
    return result;
  }
  
  // Calculate weighted averages (recent data gets higher weight)
  let winterSum = 0;
  let winterWeightSum = 0;
  let summerSum = 0;
  let summerWeightSum = 0;
  
  winterSessions.forEach(d => {
    const weight = isRecentData(d) ? 5.0 : 1.0;
    winterSum += d.marks * weight;
    winterWeightSum += weight;
  });
  
  summerSessions.forEach(d => {
    const weight = isRecentData(d) ? 5.0 : 1.0;
    summerSum += d.marks * weight;
    summerWeightSum += weight;
  });
  
  const winterAvg = winterSum / winterWeightSum;
  const summerAvg = summerSum / summerWeightSum;
  
  // Calculate weighted overall average
  let totalSum = 0;
  let totalWeightSum = 0;
  
  data.forEach(d => {
    const weight = isRecentData(d) ? 5.0 : 1.0;
    totalSum += d.marks * weight;
    totalWeightSum += weight;
  });
  
  const overallAvg = totalSum / totalWeightSum;
  
  // Calculate effects
  const winterEffect = winterAvg - overallAvg;
  const summerEffect = summerAvg - overallAvg;
  
  // Calculate strength of seasonality
  let strength = 0;
  
  // If the effect is consistent, increase strength
  if ((winterEffect > 0 && summerEffect < 0) || (winterEffect < 0 && summerEffect > 0)) {
    // Calculate the magnitude of difference
    const magnitude = Math.abs(winterAvg - summerAvg);
    
    // Normalize the strength (0-1)
    strength = Math.min(0.95, magnitude / (overallAvg * 0.2));
  }
  
  return {
    winterEffect,
    summerEffect,
    strength
  };
}

/**
 * Calculate average of recent data points
 */
function calculateRecentAverage(data: GradeBoundary[]) {
  if (data.length === 0) return 0;
  
  // Check for recent data (2023+)
  const recentData = data.filter(isRecentData);
  
  if (recentData.length > 0) {
    // If we have recent data, use it with higher weight
    return recentData.reduce((sum, d) => sum + d.marks, 0) / recentData.length;
  }
  
  // Otherwise use last 3 points with higher weight on most recent
  const recentPoints = data.slice(-Math.min(3, data.length));
  const weights = [0.5, 0.3, 0.2].slice(-recentPoints.length);
  
  let weightedSum = 0;
  let weightSum = 0;
  
  recentPoints.forEach((point, i) => {
    weightedSum += point.marks * weights[i];
    weightSum += weights[i];
  });
  
  return weightSum === 0 ? recentPoints[0].marks : weightedSum / weightSum;
}

/**
 * Calculate trend-based prediction
 */
function calculateTrendBasedPrediction(data: GradeBoundary[], trend: {slope: number}) {
  if (data.length === 0) return 0;
  if (data.length === 1) return data[0].marks;
  
  // Last known value + trend adjustment
  const lastValue = data[data.length - 1].marks;
  return lastValue + trend.slope;
}

/**
 * Ensure the prediction stays within reasonable bounds
 */
function ensureReasonableBounds(prediction: number, data: GradeBoundary[]) {
  if (data.length === 0) return prediction;
  
  // Check for recent data (2023+)
  const recentData = data.filter(isRecentData);
  
  // If we have recent data, use tighter bounds around recent values
  if (recentData.length > 0) {
    const recentMarks = recentData.map(d => d.marks);
    const recentMin = Math.min(...recentMarks);
    const recentMax = Math.max(...recentMarks);
    const recentRange = recentMax - recentMin;
    
    // Allow prediction to be within a narrower range of recent values
    const lowerBound = Math.max(0, recentMin - recentRange * 0.15);
    const upperBound = recentMax + recentRange * 0.15;
    
    return Math.max(lowerBound, Math.min(upperBound, prediction));
  }
  
  // For older data, use wider bounds
  const marks = data.map(d => d.marks);
  const min = Math.min(...marks);
  const max = Math.max(...marks);
  const range = max - min;
  
  const lowerBound = Math.max(0, min - range * 0.2);
  const upperBound = max + range * 0.2;
  
  return Math.max(lowerBound, Math.min(upperBound, prediction));
}

/**
 * Calculate improved confidence interval
 */
function calculateImprovedConfidence(
  data: GradeBoundary[],
  prediction: number,
  trendStability: number,
  seasonalStrength: number,
  hasRecentData: boolean = false
) {
  if (data.length <= 1) {
    return {
      lower: Math.max(0, Math.floor(prediction * 0.9)),
      upper: Math.ceil(prediction * 1.1),
      level: 0.7
    };
  }
  
  // If we have recent data, narrow the confidence interval
  const recentDataFactor = hasRecentData ? 0.7 : 1.0;
  
  // Calculate historical variance (weighted if we have recent data)
  let weightedVariance;
  
  if (hasRecentData) {
    // Focus more on recent data for variance calculation
    const recentData = data.filter(isRecentData);
    const recentMarks = recentData.map(d => d.marks);
    const recentAvg = recentMarks.reduce((sum, m) => sum + m, 0) / recentMarks.length;
    weightedVariance = recentMarks.reduce((sum, m) => sum + Math.pow(m - recentAvg, 2), 0) / recentMarks.length;
  } else {
    // Use all data with equal weights
    const marks = data.map(d => d.marks);
    const avg = marks.reduce((sum, m) => sum + m, 0) / marks.length;
    weightedVariance = marks.reduce((sum, m) => sum + Math.pow(m - avg, 2), 0) / marks.length;
  }
  
  const stdDev = Math.sqrt(weightedVariance);
  
  // Calculate confidence interval width
  const baseWidth = stdDev * 1.5 * recentDataFactor;
  
  // Adjust width based on sample size (smaller with more samples)
  const sampleFactor = Math.max(0.6, Math.min(1.3, 3 / data.length));
  
  // Adjust width based on stability (narrower with stable trends)
  const stabilityFactor = Math.max(0.7, 1.5 - trendStability);
  
  // Adjust width based on seasonal strength
  const seasonalityFactor = 1 + (seasonalStrength * 0.3);
  
  const intervalWidth = baseWidth * sampleFactor * stabilityFactor * seasonalityFactor;
  
  return {
    lower: Math.max(0, Math.floor(prediction - intervalWidth)),
    upper: Math.ceil(prediction + intervalWidth),
    level: hasRecentData ? 0.98 : 0.95  // Higher confidence if we have recent data
  };
}

/**
 * Calculate overall reliability of the prediction
 */
function calculateReliability(
  dataPoints: number,
  trendStability: number,
  seasonalStrength: number,
  confidenceWidth: number,
  hasRecentData: boolean = false
): number {
  // Base reliability from sample size
  const sampleReliability = Math.min(0.9, dataPoints / 8);
  
  // Reliability from trend stability
  const trendReliability = trendStability;
  
  // Reliability from seasonal pattern
  const seasonalReliability = seasonalStrength > 0.3 ? 0.8 : 0.5;
  
  // Reliability from confidence interval (narrower = more reliable)
  const avgMark = 70; // Approximate value for scaling
  const confidenceReliability = Math.max(0.3, Math.min(0.9, 1 - (confidenceWidth / avgMark)));
  
  // Boost reliability significantly if we have recent data
  const recentDataBoost = hasRecentData ? 0.15 : 0;
  
  // Weighted combination
  return Math.min(0.98, (
    sampleReliability * 0.2 + 
    trendReliability * 0.3 + 
    seasonalReliability * 0.1 + 
    confidenceReliability * 0.2 + 
    recentDataBoost
  ));
}