"use client";

import { useState } from "react";
import { ConversionData } from "@/types/conversion";
import { conversionApi } from "@/lib/api/conversion";
import SubjectSelector from "@/components/tools/raw-to-ums/shared/SubjectSelector";
import SessionSelector from "@/components/tools/raw-to-ums/shared/SessionSelector";
import QuickConverter from "@/components/tools/raw-to-ums/QuickConverter";
import ConversionTable from "@/components/tools/raw-to-ums/ConversionTable";
import GradeBoundaries from "@/components/tools/raw-to-ums/GradeBoundaries";

type TabId = "quick" | "table" | "boundaries";

interface Tab {
  id: TabId;
  label: string;
}

const tabs: Tab[] = [
  { id: "quick", label: "Quick Convert" },
  { id: "table", label: "Conversion Table" },
  { id: "boundaries", label: "Grade Boundaries" },
];

export default function RawToUmsPage() {
  const [selectedTab, setSelectedTab] = useState<TabId>("quick");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversionData, setConversionData] = useState<ConversionData | null>(null);
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);

  // Handle session change - this comes first in the flow
  const handleSessionChange = (session: string | null) => {
    setSelectedSession(session);
    setSelectedSubject(null);
    setSelectedUnit(null);
    setConversionData(null);
  };

  // Handle subject change - depends on session
  const handleSubjectChange = (subjectId: string | null) => {
    setSelectedSubject(subjectId);
    setSelectedUnit(null);
    setConversionData(null);
  };

  // Handle unit change - depends on session and subject
  const handleUnitChange = async (apiPath: string | null) => {
    setSelectedUnit(apiPath);
    setConversionData(null);

    if (apiPath && selectedSubject && selectedSession) {
      setLoading(true);
      setError(null);
      try {
        const data = await conversionApi.getConversionData(
          selectedSubject,
          apiPath,
          selectedSession
        );
        setConversionData(data);
      } catch (err) {
        setError("Failed to load conversion data. Please try again.");
        console.error("Error loading conversion data:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Page Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-text">
            Raw to UMS Converter
          </h1>
          <button
            onClick={() => {
              setSelectedSession(null);
              setSelectedSubject(null);
              setSelectedUnit(null);
              setConversionData(null);
            }}
            className="text-sm text-text-muted hover:text-text transition-colors duration-200"
          >
            Reset filters
          </button>
        </div>
        <p className="text-text-muted">
          Convert raw marks to UMS scores and view grade boundaries
        </p>
      </header>

      {/* Subject Selection */}
      <div className="mb-6 p-4 bg-surface rounded-lg border border-border">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Subject & Unit Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-muted">
              Subject & Unit
            </label>
            <div className="transition-all duration-200">
              <SubjectSelector
                session={selectedSession}
                selectedSubject={selectedSubject}
                selectedUnit={selectedUnit}
                onSubjectChange={handleSubjectChange}
                onUnitChange={handleUnitChange}
              />
            </div>
          </div>

          {/* Session Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-muted">
              Session
            </label>
            <div className="transition-all duration-200">
              <SessionSelector
                selectedSession={selectedSession}
                onSessionChange={handleSessionChange}
              />
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="text-center p-8 bg-surface rounded-lg border border-border">
          <h2 className="text-xl font-semibold text-text mb-2">Error</h2>
          <p className="text-text-muted">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Tabs Navigation */}
          <div className="border-b border-border mb-6">
            <nav className="flex gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium transition-colors
                    ${
                      selectedTab === tab.id
                        ? "border-b-2 border-primary text-primary"
                        : "text-text-muted hover:text-text"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {selectedTab === "quick" && (
              <QuickConverter
                conversionData={conversionData}
                loading={loading}
              />
            )}
            {selectedTab === "table" && (
              <ConversionTable
                conversionData={conversionData}
                loading={loading}
              />
            )}
            {selectedTab === "boundaries" && (
              <GradeBoundaries
                conversionData={conversionData}
                loading={loading}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}