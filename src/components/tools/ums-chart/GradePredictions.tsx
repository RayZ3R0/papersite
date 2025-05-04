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

// Simple grade colors with good contrast
const GRADE_COLORS = {
  "A*": "#4C1D95", // Purple
  "A": "#1E40AF",  // Blue
  "B": "#047857",  // Green
  "C": "#B45309",  // Amber
  "D": "#9D174D",  // Pink
  "E": "#9CA3AF",  // Gray
  "U": "#6B7280"   // Dark gray
};

export default function GradePredictions({
  historicalData,
  targetSession,
  grades,
  showConfidenceIntervals = true,
  onPredictionUpdate
}: GradePredictionsProps) {
  const [hoveredGrade, setHoveredGrade] = useState<string | null>(null);
  
  // Calculate predictions
  const predictionResults = useMemo(() => {
    if (!historicalData.length) return [];
    
    try {
      return improvedPredictGradeBoundaries(historicalData, grades, targetSession);
    } catch (error) {
      console.error("Error generating predictions:", error);
      return [];
    }
  }, [historicalData, grades, targetSession]);
  
  // Update parent component
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

  // Empty state handlers
  if (!historicalData.length) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-surface/30 border border-border rounded-lg">
        <div className="text-center p-6">
          <div className="text-2xl text-text-muted mb-2">No Historical Data</div>
          <p className="text-text-muted max-w-md">
            Select a subject and unit that contains grade boundary data to generate predictions.
          </p>
        </div>
      </div>
    );
  }

  if (!predictionResults.length) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-surface/30 border border-border rounded-lg">
        <div className="text-center p-6">
          <div className="text-2xl text-text-muted mb-2">Unable to Generate Predictions</div>
          <p className="text-text-muted max-w-md">
            There isn't enough historical data to make reliable predictions.
          </p>
        </div>
      </div>
    );
  }

  // Format session name for display
  const formattedSession = targetSession.replace('_', ' ');
  
  // Find max mark value for the chart (round up to nearest 5)
  const maxMark = Math.ceil(Math.max(
    ...historicalData.map(h => h.marks),
    ...predictionResults.map(p => p.confidence.upper)
  ) / 5) * 5;

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
            {/* Left side: Simple bar chart */}
            <div className="relative h-[360px] bg-surface/30 border border-border rounded-lg p-4">
              <div className="flex items-end h-full space-x-2">
                {/* Y-axis labels */}
                <div className="pr-2 h-full flex flex-col justify-between text-right text-sm text-text-muted">
                  <span>{maxMark}</span>
                  <span>{Math.round(maxMark * 0.75)}</span>
                  <span>{Math.round(maxMark * 0.5)}</span>
                  <span>{Math.round(maxMark * 0.25)}</span>
                  <span>0</span>
                </div>
                
                {/* Chart bars */}
                <div className="flex-1 flex items-end justify-around h-full relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-t border-border/30"></div>
                    <div className="border-t border-border/30"></div>
                    <div className="border-t border-border/30"></div>
                    <div className="border-t border-border/30"></div>
                    <div className="border-t border-border/30"></div>
                  </div>
                  
                  {/* Bars */}
                  {predictionResults.map((result) => {
                    const isSelected = hoveredGrade === result.grade;
                    const gradeColor = GRADE_COLORS[result.grade as keyof typeof GRADE_COLORS] || "#6B7280";
                    const heightPercentage = (result.prediction / maxMark) * 100;
                    
                    // Get most recent data point
                    const gradeData = historicalData.filter(h => h.grade === result.grade);
                    const recentData = gradeData.filter(d => 
                      d.session.includes("2023") || parseInt(d.session.split('_')[1]) >= 2023
                    );
                    
                    let latestValue = null;
                    if (recentData.length > 0) {
                      const latest = [...recentData].sort((a, b) => {
                        return parseInt(b.session.split('_')[1]) - parseInt(a.session.split('_')[1]);
                      })[0];
                      latestValue = latest.marks;
                    }
                    
                    return (
                      <div 
                        key={result.grade}
                        className="relative flex flex-col items-center"
                        style={{ width: `${100 / predictionResults.length}%` }}
                        onMouseEnter={() => setHoveredGrade(result.grade)}
                        onMouseLeave={() => setHoveredGrade(null)}
                      >
                        {/* Confidence interval */}
                        {showConfidenceIntervals && (
                          <div 
                            className="absolute bottom-0 w-4 rounded opacity-30"
                            style={{
                              height: `${(result.confidence.upper / maxMark) * 100}%`,
                              backgroundColor: gradeColor
                            }}
                          />
                        )}
                        
                        {/* Main bar */}
                        <div 
                          className={`w-8 rounded-t transition-all ${isSelected ? 'shadow-md' : ''}`}
                          style={{
                            height: `${heightPercentage}%`, 
                            backgroundColor: gradeColor
                          }}
                        />
                        
                        {/* Last known value marker */}
                        {latestValue && (
                          <div 
                            className="absolute w-10 border-t border-dashed border-text-muted/50"
                            style={{ bottom: `${(latestValue / maxMark) * 100}%` }}
                          >
                            <span className="absolute -right-2 -top-5 text-xs opacity-60">
                              {latestValue}
                            </span>
                          </div>
                        )}
                        
                        {/* Prediction value */}
                        <div 
                          className={`absolute text-sm font-medium transition-all ${
                            isSelected ? 'text-foreground' : 'text-text-muted'
                          }`}
                          style={{ bottom: `${heightPercentage + 2}%` }}
                        >
                          {result.prediction}
                        </div>
                        
                        {/* Grade label */}
                        <div className={`mt-2 font-medium ${isSelected ? 'text-foreground' : 'text-text-muted'}`}>
                          {result.grade}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Legend */}
              <div className="mt-4 flex justify-center space-x-4 text-xs text-text-muted border-t border-border/30 pt-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded opacity-30 bg-text-muted mr-1"></div>
                  <span>Confidence interval</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 border-t border-dashed border-text-muted/50 mr-1"></div>
                  <span>Latest known value</span>
                </div>
              </div>
            </div>
            
            {/* Right side: Data table */}
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
              
              {/* Simple data recency indicator */}
              <div className="mt-4 p-4 bg-surface/20 border border-border rounded-lg">
                <h4 className="text-sm font-medium mb-2">Recent Data Summary</h4>
                <div className="space-y-2">
                  {grades.map(grade => {
                    const allGradeData = historicalData.filter(h => h.grade === grade);
                    const recentGradeData = allGradeData.filter(h => 
                      h.session.includes("2023") || parseInt(h.session.split('_')[1]) >= 2023
                    );
                    
                    if (allGradeData.length === 0) return null;
                    
                    return (
                      <div key={grade} className="flex items-center gap-2">
                        <div className="w-8 text-xs font-medium">{grade}</div>
                        <div className="flex-1 h-1.5 bg-surface/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.round((recentGradeData.length / allGradeData.length) * 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-text-muted">
                          {recentGradeData.length}/{allGradeData.length} recent
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-text-muted mt-3">
                  Recent data (2023+) is given significantly higher weight in predictions.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-surface/20 p-4 border-t border-border/30">
          <details className="text-sm text-text-muted">
            <summary className="cursor-pointer font-medium">About this prediction</summary>
            <p className="mt-2 leading-relaxed">
              These predictions use statistical modeling including trend analysis and
              weighted historical patterns. Data from June 2023 onwards is given
              significantly higher weight to reflect recent examination patterns.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}