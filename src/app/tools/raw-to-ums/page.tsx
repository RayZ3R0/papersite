"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

// Notification component
interface NotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const Notification = ({ message, isVisible, onClose }: NotificationProps) => {
  // Effect for auto-closing the notification
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  // Check if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Set initial value
    setIsMobile(window.innerWidth < 768);

    // Add resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`
        fixed right-4 z-[9999]
        transform transition-all duration-300 ease-in-out
        ${isMobile ? "bottom-20" : "bottom-4"}
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"}
      `}
    >
      <div className="bg-surface border border-border shadow-lg rounded-lg px-4 py-3 flex items-center gap-3">
        <div className="flex-shrink-0 text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="text-sm font-medium text-text">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 text-text-muted hover:text-text transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const tabs: Tab[] = [
  { id: "quick", label: "Quick Convert" },
  { id: "table", label: "Conversion Table" },
  { id: "boundaries", label: "Grade Boundaries" },
];

export default function RawToUmsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get initial values from URL query parameters
  const initialTab = (searchParams.get("tab") as TabId) || "quick";
  const initialSession = searchParams.get("session");
  const initialSubject = searchParams.get("subject");
  const initialUnit = searchParams.get("unit");

  const [selectedTab, setSelectedTab] = useState<TabId>(initialTab);
  const [selectedSession, setSelectedSession] = useState<string | null>(
    initialSession,
  );
  const [selectedSubject, setSelectedSubject] = useState<string | null>(
    initialSubject,
  );
  const [selectedUnit, setSelectedUnit] = useState<string | null>(initialUnit);
  const [loading, setLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversionData, setConversionData] = useState<ConversionData | null>(
    null,
  );
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);

  // Notification state
  const [notification, setNotification] = useState({
    message: "",
    isVisible: false,
  });

  // Show notification
  const showNotification = (message: string) => {
    setNotification({
      message,
      isVisible: true,
    });
  };

  // Hide notification
  const hideNotification = () => {
    setNotification((prev) => ({
      ...prev,
      isVisible: false,
    }));
  };

  // Update URL parameters when selections change
  const updateUrlParams = (params: {
    tab?: TabId;
    session?: string | null;
    subject?: string | null;
    unit?: string | null;
  }) => {
    const newParams = new URLSearchParams(searchParams);

    if (params.tab) {
      newParams.set("tab", params.tab);
    }

    if (params.session !== undefined) {
      if (params.session) {
        newParams.set("session", params.session);
      } else {
        newParams.delete("session");
      }
    }

    if (params.subject !== undefined) {
      if (params.subject) {
        newParams.set("subject", params.subject);
      } else {
        newParams.delete("subject");
      }
    }

    if (params.unit !== undefined) {
      if (params.unit) {
        newParams.set("unit", params.unit);
      } else {
        newParams.delete("unit");
      }
    }

    // Update URL without reloading the page
    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  // Handle tab change
  const handleTabChange = (tab: TabId) => {
    setSelectedTab(tab);
    updateUrlParams({ tab });
  };

  // Handle session change - this comes first in the flow
  const handleSessionChange = (session: string | null) => {
    setSelectedSession(session);
    setSelectedSubject(null);
    setSelectedUnit(null);
    setConversionData(null);
    updateUrlParams({ session, subject: null, unit: null });
  };

  // Handle subject change - depends on session
  const handleSubjectChange = (subjectId: string | null) => {
    setSelectedSubject(subjectId);
    setSelectedUnit(null);
    setConversionData(null);
    updateUrlParams({ subject: subjectId, unit: null });
  };

  // Handle unit change - depends on session and subject
  const handleUnitChange = async (apiPath: string | null) => {
    setSelectedUnit(apiPath);
    setConversionData(null);
    updateUrlParams({ unit: apiPath });

    if (apiPath && selectedSubject && selectedSession) {
      setLoading(true);
      setError(null);
      try {
        const data = await conversionApi.getConversionData(
          selectedSubject,
          apiPath,
          selectedSession,
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

  // Load data on initial mount if URL params are present
  useEffect(() => {
    const loadInitialData = async () => {
      if (
        initialSession &&
        initialSubject &&
        initialUnit &&
        !initialLoadComplete
      ) {
        setLoading(true);
        setError(null);
        try {
          const data = await conversionApi.getConversionData(
            initialSubject,
            initialUnit,
            initialSession,
          );
          setConversionData(data);
          setInitialLoadComplete(true);
        } catch (err) {
          setError("Failed to load conversion data. Please try again.");
          console.error(
            "Error loading conversion data from URL parameters:",
            err,
          );
        } finally {
          setLoading(false);
        }
      }
    };

    loadInitialData();
  }, [initialSession, initialSubject, initialUnit, initialLoadComplete]);

  // Reset handler
  const handleReset = () => {
    setSelectedSession(null);
    setSelectedSubject(null);
    setSelectedUnit(null);
    setConversionData(null);
    updateUrlParams({ session: null, subject: null, unit: null });
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
            onClick={handleReset}
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
                  onClick={() => handleTabChange(tab.id)}
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

          {/* Share Button */}
          {selectedSession && selectedSubject && selectedUnit && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  const shareUrl = window.location.href;
                  navigator.clipboard.writeText(shareUrl);
                  showNotification("Link copied to clipboard");
                }}
                className="px-3 py-1 text-sm bg-surface border border-border rounded-md
                  text-text-muted hover:text-text flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                Share
              </button>
            </div>
          )}

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

      {/* Notification Component */}
      <Notification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
}
