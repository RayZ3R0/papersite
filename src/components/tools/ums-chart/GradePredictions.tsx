"use client";

import { useMemo, useEffect, useState } from "react";
import { GradeBoundary } from "@/lib/gradePredictor";
import { improvedPredictGradeBoundaries, ImprovedPredictionResult } from "@/lib/improvedPredictor";

interface GradePredictionsProps {
  historicalData: GradeBoundary[];
  targetSession: string;
  grades: string[];
  showConfidenceIntervals?: boolean;
  onPredictionUpdate?: (predictions: Array<{grade: string; prediction: number}>) => void;
}

// Grade colors based on UK examination grades
const GRADE_COLORS = {
  "A*": "#4C1D95", // Deep purple
  "A": "#1E40AF", // Deep blue
  "B": "#047857", // Deep green
  "C": "#B45309", // Deep amber
  "D": "#9D174D", // Deep pink
  "E": "#9CA3AF", // Gray
  "U": "#6B7280"  // Dark gray
};

export default function GradePredictions({
  historicalData,
  targetSession,
  grades,
  showConfidenceIntervals = true,
  onPredictionUpdate
}: GradePredictionsProps) {
  const [hoveredGrade, setHoveredGrade] = useState<string | null>(null);
  
  // Calculate predictions using the improved algorithm
  const predictionResults = useMemo(() => {
    if (!historicalData.length) return [];
    
    try {
      // Group data by grade for more efficient processing
      const gradeGroups: Record<string, GradeBoundary[]> = {};
      
      historicalData.forEach(boundary => {
        if (!gradeGroups[boundary.grade]) {
          gradeGroups[boundary.grade] = [];
        }
        gradeGroups[boundary.grade].push(boundary);
      });
      
      // Get predictions for all requested grades
      return improvedPredictGradeBoundaries(historicalData, grades, targetSession);
    } catch (error) {
      console.error("Error generating predictions:", error);
      return [];
    }
  }, [historicalData, grades, targetSession]);
  
  // Update parent component when predictions change
  useEffect(() => {
    if (onPredictionUpdate && predictionResults.length > 0) {
      onPredictionUpdate(
        predictionResults.map(result => ({
          grade: result.grade,
          prediction: result.prediction
        }))
      );
    }
  }, [predictionResults, onPredictionUpdate]);

  // Don't render if there's no historical data
  if (!historicalData.length) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-surface/30 border border-border rounded-lg">
        <div className="text-center p-6">
          <div className="text-2xl text-text-muted mb-2">No Historical Data</div>
          <p className="text-text-muted max-w-md">
            Select a subject and unit that contains grade boundary data to generate predictions.
          </p>
        </div>
      </div>
    );
  }

  // Don't render if no predictions could be generated
  if (!predictionResults.length) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-surface/30 border border-border rounded-lg">
        <div className="text-center p-6">
          <div className="text-2xl text-text-muted mb-2">Unable to Generate Predictions</div>
          <p className="text-text-muted max-w-md">
            There isn't enough historical data to make reliable predictions.
            Need at least 2 data points per grade.
          </p>
        </div>
      </div>
    );
  }

  // Format session name for display
  const formattedSession = targetSession.replace('_', ' ');

  // Find the maximum predicted value to scale the chart properly
  const maxPrediction = Math.max(
    ...predictionResults.map(result => result.prediction),
    ...predictionResults.map(result => result.confidence.upper),
    ...historicalData.map(h => h.marks)
  );

  // Determine the scale for visualization (round up to nearest 10)
  const chartMaxScale = Math.ceil(maxPrediction / 10) * 10;

  return (
    <div className="space-y-8">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-surface/40 p-4 border-b border-border/50">
          <h3 className="font-semibold text-lg">Predicted Grade Boundaries for {formattedSession}</h3>
          <p className="text-sm text-text-muted mt-1">
            Based on {historicalData.length} historical data points across {
              [...new Set(historicalData.map(item => item.session))].length
            } sessions
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side: Visualization */}
            <div className="relative h-[400px] bg-surface/30 rounded-lg border border-border/50 overflow-hidden p-4">
              {/* Visual scale - now dynamic based on max value */}
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-b from-surface to-surface flex flex-col justify-between py-6 px-4 text-sm text-text-muted">
                <span>{chartMaxScale}</span>
                <span>{Math.round(chartMaxScale * 0.75)}</span>
                <span>{Math.round(chartMaxScale * 0.5)}</span>
                <span>{Math.round(chartMaxScale * 0.25)}</span>
                <span>0</span>
              </div>
              
              {/* Grid lines for better readability */}
              <div className="absolute left-16 right-4 top-6 bottom-6 grid grid-rows-4 pointer-events-none">
                {[0.75, 0.5, 0.25, 0].map((level, i) => (
                  <div 
                    key={i} 
                    className="border-t border-border/30"
                    style={{ height: i === 3 ? '1px' : 'auto' }}
                  ></div>
                ))}
              </div>
              
              {/* Prediction bars */}
              <div className="ml-16 h-full flex items-end space-x-3 relative px-4">
                {predictionResults.map((result: ImprovedPredictionResult) => {
                  // Calculate percentages based on the chart scale
                  const heightPercentage = (result.prediction / chartMaxScale) * 100;
                  const isHovered = hoveredGrade === result.grade;
                  const gradeColor = GRADE_COLORS[result.grade as keyof typeof GRADE_COLORS] || "#6B7280";
                  
                  // Calculate historical range
                  const gradeData = historicalData.filter(h => h.grade === result.grade);
                  const minHistorical = Math.min(...gradeData.map(h => h.marks));
                  const maxHistorical = Math.max(...gradeData.map(h => h.marks));
                  const minHeightPercentage = (minHistorical / chartMaxScale) * 100;
                  const maxHeightPercentage = (maxHistorical / chartMaxScale) * 100;
                  
                  // Calculate confidence intervals
                  const lowerConfidence = (result.confidence.lower / chartMaxScale) * 100;
                  const upperConfidence = (result.confidence.upper / chartMaxScale) * 100;
                  
                  return (
                    <div 
                      key={result.grade}
                      className="flex-1 flex flex-col items-center justify-end relative group"
                      onMouseEnter={() => setHoveredGrade(result.grade)}
                      onMouseLeave={() => setHoveredGrade(null)}
                    >
                      {/* Render historical data points */}
                      {gradeData.map((dataPoint, idx) => {
                        const pointHeight = (dataPoint.marks / chartMaxScale) * 100;
                        const isRecent = dataPoint.session.includes("2023") || 
                                        parseInt(dataPoint.session.split('_')[1]) >= 2023;
                        
                        return (
                          <div 
                            key={`${dataPoint.session}-${idx}`}
                            className={`absolute w-2 h-2 rounded-full transform -translate-x-1/2 border-2 ${
                              isRecent ? 'border-primary' : 'border-text-muted/50'
                            }`}
                            style={{
                              bottom: `${pointHeight}%`,
                              left: '50%',
                              backgroundColor: isRecent ? GRADE_COLORS[result.grade as keyof typeof GRADE_COLORS] : 'transparent'
                            }}
                            title={`${dataPoint.session}: ${dataPoint.marks} marks`}
                          />
                        );
                      })}
                      
                      {/* Historical range */}
                      <div 
                        className="absolute w-6 border border-text-muted/30 bg-text-muted/5"
                        style={{
                          bottom: `${minHeightPercentage}%`,
                          height: `${maxHeightPercentage - minHeightPercentage}%`,
                          left: 'calc(50% - 0.75rem)'
                        }}
                      />
                      
                      {/* Confidence interval */}
                      {showConfidenceIntervals && (
                        <div 
                          className={`absolute w-10 ${isHovered ? 'bg-text-muted/20' : 'bg-text-muted/10'} transition-colors`}
                          style={{
                            bottom: `${lowerConfidence}%`,
                            height: `${upperConfidence - lowerConfidence}%`,
                            left: 'calc(50% - 1.25rem)'
                          }}
                        />
                      )}
                      
                      {/* Prediction bar */}
                      <div 
                        className={`w-3 transition-all duration-200 ${isHovered ? 'bg-accent' : ''}`}
                        style={{
                          height: `${heightPercentage}%`, 
                          backgroundColor: isHovered ? undefined : gradeColor,
                          boxShadow: isHovered ? '0 0 10px rgba(0,0,0,0.2)' : 'none'
                        }}
                      />
                      
                      {/* Prediction marker (horizontal line) */}
                      <div 
                        className={`absolute w-10 h-0.5 -translate-x-1/2 ${isHovered ? 'bg-accent' : gradeColor}`}
                        style={{
                          bottom: `${heightPercentage}%`,
                          left: '50%'
                        }}
                      />

                      {/* Grade label */}
                      <div className={`mt-4 font-medium transition-transform duration-200 ${isHovered ? 'scale-110 text-foreground' : 'text-text-muted'}`}>
                        {result.grade}
                      </div>
                      
                      {/* Tooltip */}
                      <div className={`
                        absolute bottom-full mb-2 bg-popover border border-border rounded-lg p-3 shadow-lg
                        transition-all duration-200 w-56 text-sm z-10
                        ${isHovered ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}
                      `}>
                        <div className="font-medium text-lg text-center mb-2">
                          Grade {result.grade}
                          <div className="text-xs text-text-muted font-normal">
                            Prediction for {formattedSession}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-text-muted">Prediction:</span>
                            <span className="font-medium">{result.prediction} marks</span>
                          </div>
                          {showConfidenceIntervals && (
                            <div className="flex justify-between">
                              <span className="text-text-muted">Range:</span>
                              <span>{result.confidence.lower} - {result.confidence.upper}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-text-muted">Historical range:</span>
                            <span>{minHistorical} - {maxHistorical}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Latest (2023+):</span>
                            <span>
                              {(() => {
                                const recentData = gradeData.filter(d => 
                                  d.session.includes("2023") || parseInt(d.session.split('_')[1]) >= 2023
                                );
                                return recentData.length > 0 
                                  ? `${recentData[recentData.length-1].marks} marks` 
                                  : "No data";
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Confidence:</span>
                            <span>{Math.round(result.reliability * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="absolute left-16 bottom-0 right-0 flex justify-center space-x-4 pb-1 pt-2 text-xs text-text-muted border-t border-border/30">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full border-2 border-primary mr-1"></div>
                  <span>Recent data (2023+)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full border-2 border-text-muted/50 mr-1"></div>
                  <span>Historical data</span>
                </div>
              </div>
            </div>
            
            {/* Right side: Detailed data */}
            <div>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface/50 border-b border-border/50">
                      <th className="p-3 text-left font-medium">Grade</th>
                      <th className="p-3 text-left font-medium">Prediction</th>
                      {showConfidenceIntervals && (
                        <th className="p-3 text-left font-medium hidden sm:table-cell">Range</th>
                      )}
                      <th className="p-3 text-left font-medium">Reliability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionResults.map((result: ImprovedPredictionResult) => (
                      <tr 
                        key={result.grade} 
                        className={`border-b border-border/30 hover:bg-surface/30 transition-colors ${
                          hoveredGrade === result.grade ? 'bg-surface/50' : ''
                        }`}
                        onMouseEnter={() => setHoveredGrade(result.grade)}
                        onMouseLeave={() => setHoveredGrade(null)}
                      >
                        <td className="p-3">
                          <span className="font-medium">{result.grade}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-mono">{result.prediction}</span> marks
                        </td>
                        {showConfidenceIntervals && (
                          <td className="p-3 hidden sm:table-cell text-text-muted">
                            {result.confidence.lower} - {result.confidence.upper}
                          </td>
                        )}
                        <td className="p-3">
                          <div className="flex items-center">
                            <div className="w-16 bg-surface/50 rounded-full h-2 mr-2">
                              <div 
                                className="h-full rounded-full" 
                                style={{
                                  width: `${Math.round(result.reliability * 100)}%`,
                                  backgroundColor: GRADE_COLORS[result.grade as keyof typeof GRADE_COLORS] || "#6B7280"
                                }}
                              />
                            </div>
                            <span className="text-xs text-text-muted">
                              {Math.round(result.reliability * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Historical data summary */}
              <div className="mt-6 bg-surface/30 p-4 rounded-lg border border-border/50">
                <h4 className="font-medium mb-2">Historical Data Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-text-muted block">Sessions:</span>
                      <span>{[...new Set(historicalData.map(d => d.session.replace('_', ' ')))].join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Date Range:</span>
                      <span>
                        {
                          [...new Set(historicalData.map(d => d.session.split('_')[1]))]
                            .sort()
                            .join(' - ')
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-text-muted block">Recent Data (2023+):</span>
                    <span className="text-accent-foreground">
                      {(() => {
                        const recentData = historicalData.filter(d => 
                          d.session.includes("2023") || parseInt(d.session.split('_')[1]) >= 2023
                        );
                        return recentData.length > 0 
                          ? `${recentData.length} records (weighted heavily in predictions)` 
                          : "None available";
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Explanation and methodology footer */}
        <div className="bg-surface/20 p-4 border-t border-border/30">
          <details className="text-sm text-text-muted">
            <summary className="cursor-pointer font-medium">About this prediction</summary>
            <p className="mt-2 leading-relaxed">
              These predictions use advanced statistical modeling techniques including trend analysis, 
              seasonality detection, and weighted historical patterns. Data from June 2023 onwards is given
              significantly higher weight in the predictions to reflect recent examination patterns.
              {showConfidenceIntervals && " Confidence intervals represent the likely range for the actual boundary."}
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}