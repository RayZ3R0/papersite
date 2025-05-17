"use client";

import UMSChart from "@/components/tools/ums-chart";
import GradePredictions from "@/components/tools/ums-chart/GradePredictions";
import SubjectSelector from "@/components/tools/ums-chart/SubjectSelector";
import UnitSelector from "@/components/tools/ums-chart/UnitSelector";
import { Subject, Unit, UMSData } from "@/types/ums";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GradeBoundary } from "@/lib/gradePredictor";

// View types for tab navigation
const VIEWS = {
  HISTORICAL: "historical",
  PREDICTIONS: "predictions"
} as const;

type ViewType = typeof VIEWS[keyof typeof VIEWS];

export default function UMSChartPage() {
  // Core state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject>();
  const [selectedUnit, setSelectedUnit] = useState<Unit>();
  const [umsData, setUMSData] = useState<UMSData>();
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);

  // View state
  const [currentView, setCurrentView] = useState<ViewType>(VIEWS.HISTORICAL);
  
  // Prediction state
  const [targetSession, setTargetSession] = useState("June_2025");
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState(true);
  const [predictions, setPredictions] = useState<Array<{grade: string; prediction: number}>>([]);
  const [predictionsLoading, setPredictionsLoading] = useState<boolean>(false);

  // Transform UMS data into historical boundaries format with enhanced error handling
  const historicalBoundaries = useMemo<GradeBoundary[]>(() => {
    if (!umsData?.sessions || !selectedUnit) {
      console.log("Missing data for historicalBoundaries:", { 
        hasSessions: Boolean(umsData?.sessions), 
        hasUnit: Boolean(selectedUnit) 
      });
      return [];
    }

    const boundaries: GradeBoundary[] = [];
    let debugCounts: Record<string, number> = {};
    
    try {
      // Process each session
      umsData.sessions.forEach(session => {
        // Find grade boundaries in this session
        const gradeBoundaries = session.data.filter(record => record.GRADE && record.RAW !== undefined);
        
        // Add each grade boundary as a separate entry
        gradeBoundaries.forEach(record => {
          if (record.GRADE && record.RAW !== undefined) {
            // Increment debug counter
            debugCounts[record.GRADE] = (debugCounts[record.GRADE] || 0) + 1;
            
            boundaries.push({
              grade: record.GRADE,
              marks: record.RAW,
              session: session.session,
              paper: selectedUnit.id
            });
          }
        });
      });
      
      // Log recent data availability (2023+)
      const recentData = boundaries.filter(b => {
        const year = parseInt(b.session.split('_')[1], 10);
        return year >= 2023;
      });
      
      console.log("Extracted grade boundaries:", {
        total: boundaries.length,
        byGrade: debugCounts,
        recentDataPoints: recentData.length,
        sample: boundaries.slice(0, 2)
      });
      
      return boundaries;
    } catch (error) {
      console.error("Error processing historical boundaries:", error);
      return [];
    }
  }, [umsData, selectedUnit]);

  // Set loading state for predictions tab
  useEffect(() => {
    if (currentView === VIEWS.PREDICTIONS) {
      setPredictionsLoading(true);
      
      // Add a small delay to ensure UI updates
      const timer = setTimeout(() => {
        setPredictionsLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentView, selectedUnit, umsData]);

  // Fetch available subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        // Use the proxy API endpoint instead of direct call
        const response = await fetch('/api/ums?path=/subjects');
        if (!response.ok) throw new Error('Failed to fetch subjects');
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch subjects');
        }
        
        setSubjects(result.data);
        setError(undefined);
      } catch (err) {
        setError('Failed to load subjects. Please try again.');
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Fetch available units when subject is selected
  const handleSubjectSelect = async (subject: Subject) => {
    setLoading(true);
    setSelectedSubject(subject);
    setSelectedUnit(undefined);
    setUMSData(undefined);
    
    // Clear available units immediately to prevent stale data showing up
    setAvailableUnits([]);
    
    try {
      // Use the proxy API endpoint instead of direct call
      const response = await fetch(
        `/api/ums?path=/subjects/${subject.id}/units`
      );
      if (!response.ok) throw new Error("Failed to fetch units");
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch units");
      }
      
      const units: Unit[] = result.data;
      
      // Filter out duplicate units by ID (the API returns duplicates for WMA14)
      const uniqueUnits = units.reduce((acc: Unit[], unit) => {
        // Check if we already have a unit with this ID
        const isDuplicate = acc.some(existingUnit => existingUnit.id === unit.id);
        if (!isDuplicate) {
          acc.push(unit);
        }
        return acc;
      }, []);
      
      setAvailableUnits(uniqueUnits);
      setError(undefined);
    } catch (err) {
      setError("Failed to load units. Please try again.");
      setAvailableUnits([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch UMS data when unit is selected
  const handleUnitSelect = useCallback(async (unit: Unit) => {
    if (!selectedSubject) return;
    
    setLoading(true);
    setSelectedUnit(unit);
    setUMSData(undefined);
    setPredictions([]);

    try {
      // Use the proxy API endpoint instead of direct call
      const response = await fetch(
        `/api/ums?path=/subjects/${selectedSubject.id}/units/${unit.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch UMS data");
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch UMS data");
      }
      
      const data: UMSData = result.data;
      setUMSData(data);
      setError(undefined);
    } catch (err) {
      setError("Failed to load UMS data. Please try again.");
      setUMSData(undefined);
    } finally {
      setLoading(false);
    }
  }, [selectedSubject]);

  return (
    <main className="container mx-auto py-8 space-y-6">
      <div className="prose dark:prose-invert">
        <h1 className="mb-3">UMS Analysis</h1>
        <p className="text-text-muted leading-relaxed">
          Analyze historical UMS patterns and predict future grade boundaries.
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Selection Controls */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Subject Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text/90">
                Subject
              </label>
              <SubjectSelector
                subjects={subjects}
                selectedSubject={selectedSubject}
                onSubjectChange={handleSubjectSelect}
                loading={loading && !selectedSubject}
                disabled={loading && !subjects.length}
              />
            </div>

            {/* Unit Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text/90">
                Unit
              </label>
              <UnitSelector
                units={availableUnits}
                selectedUnit={selectedUnit}
                onUnitChange={handleUnitSelect}
                loading={loading && !!selectedSubject && !selectedUnit}
                disabled={!selectedSubject || availableUnits.length === 0}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* View Selection Tabs */}
          <div className="flex gap-2 border-b border-border pb-4">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === VIEWS.HISTORICAL
                  ? "bg-primary text-primary-foreground"
                  : "text-text-muted hover:text-text hover:bg-surface-hover"
              }`}
              onClick={() => setCurrentView(VIEWS.HISTORICAL)}
            >
              Historical View
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === VIEWS.PREDICTIONS
                  ? "bg-primary text-primary-foreground"
                  : "text-text-muted hover:text-text hover:bg-surface-hover"
              }`}
              onClick={() => setCurrentView(VIEWS.PREDICTIONS)}
            >
              Predictions
            </button>
          </div>

          {/* Chart Container */}
          {currentView === VIEWS.HISTORICAL ? (
            <UMSChart
              subject={selectedSubject}
              unit={selectedUnit}
              umsData={umsData}
              loading={loading}
            />
          ) : (
            <div className="space-y-6">
              {/* Prediction Controls */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text/90">
                    Target Session
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-lg bg-surface border border-border hover:bg-surface-hover focus:ring-2 focus:ring-primary/20 transition-colors"
                    value={targetSession}
                    onChange={(e) => setTargetSession(e.target.value)}
                  >
                    <option value="January_2025">January 2025</option>
                    <option value="June_2025">June 2025</option>
                    <option value="January_2026">January 2026</option>
                    <option value="June_2026">June 2026</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showConfidence"
                    checked={showConfidenceIntervals}
                    onChange={(e) => setShowConfidenceIntervals(e.target.checked)}
                    className="rounded border-border"
                  />
                  <label htmlFor="showConfidence" className="text-sm text-text-muted">
                    Show confidence intervals
                  </label>
                </div>
              </div>
              
              {/* Display note about recent data */}
              {historicalBoundaries.length > 0 && (
                <div className="text-sm bg-primary/5 border border-primary/20 p-3 rounded text-primary-foreground">
                  <strong>Note:</strong> Predictions prioritize data from June 2023 onwards. Recent examination patterns are given significantly higher weight in the analysis.
                </div>
              )}
              
              {/* Loading state for predictions */}
              {predictionsLoading || loading ? (
                <div className="h-[500px] flex items-center justify-center bg-surface/30 border border-border rounded-lg">
                  <div className="text-center">
                    <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-muted">
                      Processing prediction data...
                    </p>
                  </div>
                </div>
              ) : (
                <GradePredictions
                  historicalData={historicalBoundaries}
                  targetSession={targetSession}
                  grades={["A*", "A", "B", "C", "D", "E"]}
                  showConfidenceIntervals={showConfidenceIntervals}
                  onPredictionUpdate={(predictions) => {
                    setPredictionsLoading(false);
                    setPredictions(predictions);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}