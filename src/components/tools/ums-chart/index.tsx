"use client";

import { Subject, Unit, UMSData } from "@/types/ums";
import { useMemo, useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

interface UMSChartProps {
  subject?: Subject;
  unit?: Unit;
  umsData?: UMSData;
  loading?: boolean;
}

const VIEW_TYPES = {
  GRADE_BOUNDS: "grade-bounds",
  GRADE_DIST: "grade-dist",
  SESSION_COMP: "session-comp",
} as const;

type ViewType = (typeof VIEW_TYPES)[keyof typeof VIEW_TYPES];

interface ChartDataPoint {
  raw: number;
  [key: string]: number | string | null;
}

interface GradeDistribution {
  grade: string;
  [key: string]: string | number;
}

interface GradeBoundaryTrend {
  grade: string;
  data: {
    session: string;
    raw: number;
  }[];
  color: string;
}

const SESSION_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#6366F1", // Indigo
  "#D946EF", // Fuchsia
  "#14B8A6", // Teal
  "#F43F5E", // Rose
  "#84CC16", // Lime
  "#A855F7", // Violet
  "#0EA5E9", // Sky
  "#EAB308", // Yellow
  "#DC2626", // Red-600
  "#059669", // Emerald-600
  "#7C3AED", // Violet-600
  "#DB2777", // Pink-600
  "#0891B2", // Cyan-600
  "#CA8A04", // Yellow-600
  "#9333EA", // Purple-600
  "#BE123C", // Rose-700
  "#047857", // Emerald-700
  "#1D4ED8", // Blue-700
  "#B45309", // Amber-700
  "#7C2D12", // Orange-800
  "#991B1B", // Red-800
  "#365314", // Lime-800
  "#1E3A8A", // Blue-900
  "#92400E", // Amber-800
  "#166534", // Green-800
  "#7E22CE", // Purple-700
  "#BE185D", // Pink-700
  "#0F766E", // Teal-700
  "#C2410C", // Orange-700
  "#4338CA", // Indigo-700
  "#E11D48", // Rose-600
  "#16A34A", // Green-600
];

const GRADE_COLORS: Record<string, string> = {
  "Full UMS": "#9333EA", // Purple
  "A*": "#3B82F6", // Blue
  "*": "#3B82F6", // Blue (same as A*)
  A: "#10B981", // Green
  B: "#06B6D4", // Cyan
  C: "#F59E0B", // Amber
  D: "#EA580C", // Orange
  E: "#B91C1C", // Red
  U: "#6B7280", // Gray
};

const getChangeColor = (change: number | null) => {
  if (change === null) return "";
  return change > 0 ? "text-emerald-500" : change < 0 ? "text-rose-500" : "";
};

const formatChange = (change: number | null) => {
  if (change === null) return "";
  return `${change > 0 ? "+" : ""}${change}`;
};

// Format session name (e.g., "January_2025" -> "January 2025")
const formatSessionName = (session: string): string => {
  return session.replace(/_/g, " ");
};

// Sort sessions chronologically (newest first)
const sortSessions = (sessions: string[]): string[] => {
  return [...sessions].sort((a, b) => {
    // Extract month and year from session name
    const [monthA, yearA] = a.split("_");
    const [monthB, yearB] = b.split("_");

    // Compare years first (higher year first for reverse chronological order)
    if (yearA !== yearB) return parseInt(yearB, 10) - parseInt(yearA, 10);

    // If years are the same, compare months
    const monthOrder = {
      January: 1,
      March: 3,
      May: 5,
      June: 6,
      August: 8,
      October: 10,
      November: 11,
    };

    return (
      (monthOrder[monthB as keyof typeof monthOrder] || 0) -
      (monthOrder[monthA as keyof typeof monthOrder] || 0)
    );
  });
};

// Custom sorting function for units
const sortUnits = (units: Unit[]): Unit[] => {
  return [...units].sort((a, b) => {
    // Extract subject prefix and number from unit ID (e.g., "WCH04" -> "WCH", "04")
    const matchA = a.id.match(/^([A-Z]+)(\d+)$/);
    const matchB = b.id.match(/^([A-Z]+)(\d+)$/);
    
    if (!matchA || !matchB) {
      // Fallback to alphabetical sorting if pattern doesn't match
      return a.id.localeCompare(b.id);
    }
    
    const [, prefixA, numberA] = matchA;
    const [, prefixB, numberB] = matchB;
    
    // First sort by prefix (subject)
    if (prefixA !== prefixB) {
      return prefixA.localeCompare(prefixB);
    }
    
    // Skip custom sorting for maths units (assuming they start with 'M')
    if (prefixA.startsWith('M')) {
      return parseInt(numberA, 10) - parseInt(numberB, 10);
    }
    
    const numA = parseInt(numberA, 10);
    const numB = parseInt(numberB, 10);
    
    // Define priority order: 11-16 first, then 04-06
    const getPriority = (num: number) => {
      if (num >= 11 && num <= 16) return 1; // High priority
      if (num >= 4 && num <= 6) return 2;   // Low priority
      return 3; // Everything else at the end
    };
    
    const priorityA = getPriority(numA);
    const priorityB = getPriority(numB);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // Within same priority group, sort numerically
    return numA - numB;
  });
};

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-card rounded-xl border border-border shadow-sm overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`p-6 bg-surface/40 border-b border-border/50 ${className}`}>
    {children}
  </div>
);

const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 ${className}`}>{children}</div>;

const TabButton = ({
  active,
  onClick,
  children,
  role,
  "aria-selected": ariaSelected,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  role?: string;
  "aria-selected"?: boolean;
}) => (
  <button
    onClick={onClick}
    role={role}
    aria-selected={ariaSelected}
    className={`
      px-4 py-2.5 rounded-lg font-medium text-sm
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background
      ${
        active
          ? "bg-primary text-primary-foreground shadow-sm scale-[1.02]"
          : "text-text-muted hover:text-text hover:bg-surface-hover hover:scale-[1.01]"
      }
    `}
  >
    {children}
  </button>
);

const UnitSelector = ({ unit, subject }: { unit: Unit; subject: Subject }) => (
  <div className="relative group">
    <div
      className="
        px-4 py-3 rounded-lg bg-surface border border-border
        hover:bg-surface-hover hover:border-border/80 hover:shadow-sm
        transition-all duration-200 cursor-pointer
        flex items-center gap-3
      "
      role="button"
      aria-haspopup="true"
      aria-expanded="false"
    >
      <div className="w-2 h-2 rounded-full bg-primary/60"></div>
      <span className="font-mono font-medium text-lg">{unit.id}</span>
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
        className="text-text-muted"
      >
        <circle cx="12" cy="12" r="10"/>
        <path d="M9,9h6v6"/>
        <path d="m9,9 6,6"/>
      </svg>
    </div>
    <div
      className="
        absolute z-20 left-0 top-full mt-3 opacity-0 invisible
        group-hover:opacity-100 group-hover:visible
        transition-all duration-300 ease-out w-[320px]
        transform translate-y-2 group-hover:translate-y-0
      "
      role="tooltip"
    >
      <div
        className="
        bg-popover text-popover-foreground p-5 rounded-xl
        shadow-xl border border-border/50 backdrop-blur-sm
        before:content-[''] before:absolute before:-top-2 before:left-6
        before:w-4 before:h-4 before:bg-popover before:border-l before:border-t 
        before:border-border/50 before:rotate-45
      "
      >
        <div className="border-b border-border pb-3 mb-3">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            {subject.name}
          </h4>
          <p className="text-sm text-text-muted mt-1 font-medium">{unit.name}</p>
        </div>
        {unit.description && (
          <p className="text-sm text-text-muted leading-relaxed">
            {unit.description}
          </p>
        )}
      </div>
    </div>
  </div>
);

const SessionButton = ({
  session,
  selected,
  color,
  onClick,
  metadata,
}: {
  session: string;
  selected: boolean;
  color: string;
  onClick: () => void;
  metadata: { recordCount: number; timestamp: string };
}) => (
  <button
    className={`
      relative px-4 py-2.5 rounded-xl font-medium text-sm
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background
      transform hover:scale-105 active:scale-95
      ${
        selected
          ? "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border-2"
          : "bg-surface hover:bg-surface-hover border-2 border-transparent hover:shadow-md"
      }
    `}
    style={{
      borderColor: selected ? color : "transparent",
      ...(selected && {
        boxShadow: `0 8px 25px -8px ${color}40, 0 4px 12px -4px ${color}30`,
      }),
    }}
    onClick={onClick}
    aria-pressed={selected}
    aria-label={`${selected ? 'Deselect' : 'Select'} ${formatSessionName(session)} session`}
  >
    {/* Color indicator dot */}
    <div className="flex items-center gap-3">
      <div
        className={`
          w-3 h-3 rounded-full flex-shrink-0
          transition-all duration-300 ease-out
          ${selected ? "scale-110 shadow-sm" : "scale-100"}
        `}
        style={{
          backgroundColor: color,
          boxShadow: selected ? `0 0 8px ${color}60` : "none",
        }}
      />
      
      {/* Session name */}
      <span
        className={`
          transition-colors duration-200
          ${selected ? "text-text font-semibold" : "text-text hover:text-text"}
        `}
        style={{ color: selected ? color : undefined }}
      >
        {formatSessionName(session)}
      </span>
      
      {/* Selected indicator */}
      {selected && (
        <div
          className="flex-shrink-0 transition-all duration-200 ease-out"
          style={{ color }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="animate-in zoom-in duration-200"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      )}
    </div>
    
    {/* Subtle shine effect for selected state */}
    {selected && (
      <div 
        className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent 30%, ${color}20 50%, transparent 70%)`,
        }}
      />
    )}
    
    {/* Ripple effect overlay */}
    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
      <div 
        className={`
          absolute inset-0 rounded-xl transition-opacity duration-300
          ${selected ? "opacity-5" : "opacity-0 hover:opacity-5 active:opacity-10"}
        `}
        style={{ backgroundColor: color }}
      />
    </div>
  </button>
);

const ActionButton = ({
  onClick,
  children,
  variant = "primary",
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) => (
  <button
    className={`
      px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background
      ${
        variant === "primary"
          ? "text-primary hover:text-primary-hover bg-primary/10 hover:bg-primary/15"
          : "text-text-muted hover:text-text bg-surface hover:bg-surface-hover"
      }
    `}
    onClick={onClick}
  >
    {children}
  </button>
);

const TipBanner = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">
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
          className="text-blue-600 dark:text-blue-400"
        >
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
      </div>
      <div className="text-sm text-blue-800 dark:text-blue-200">
        {children}
      </div>
    </div>
  </div>
);

export default function UMSChart({
  subject,
  unit,
  umsData,
  loading = false,
}: UMSChartProps) {
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [viewType, setViewType] = useState<ViewType>(VIEW_TYPES.GRADE_BOUNDS);
  const [focusedPoint, setFocusedPoint] = useState<null | {
    raw: number;
    session: string;
  }>(null);

  // Get sorted sessions for UI display
  const sortedSessions = useMemo(() => {
    if (!umsData?.sessions) return [];
    return sortSessions(umsData.sessions.map((s) => s.session));
  }, [umsData]);

  // Sort sessions and set initial selection when umsData changes
  useEffect(() => {
    if (sortedSessions.length > 0) {
      // Initially select the latest 3 sessions or all if less than 3
      setSelectedSessions(
        sortedSessions.slice(0, Math.min(3, sortedSessions.length)),
      );
    }
  }, [sortedSessions]);

  // Get URL parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const view = searchParams.get("view");
    if (
      view === "grade-dist" ||
      view === "session-comp" ||
      view === "grade-bounds"
    ) {
      setViewType(view);
    }
  }, []);

  // Memoize all chart data and options
  const { chartData, gradeDistData, gradeBoundaryData, options } =
    useMemo(() => {
      if (!umsData || !selectedSessions.length) {
        return {
          chartData: [],
          gradeDistData: [],
          gradeBoundaryData: [],
          options: null as EChartsOption | null,
        };
      }

      // Calculate chart data
      const chartData: ChartDataPoint[] = (() => {
        const maxRaw = Math.max(
          ...umsData.sessions
            .flatMap((session) => session.data)
            .map((record) => record.RAW),
        );

        return Array.from({ length: maxRaw + 1 }, (_, i) => {
          const point: ChartDataPoint = { raw: i };

          selectedSessions.forEach((sessionName) => {
            const sessionData = umsData.sessions.find(
              (s) => s.session === sessionName,
            );
            const currentUMS =
              sessionData?.data.find((d) => d.RAW === i)?.UMS ?? null;

            const prevSessionIndex =
              umsData.sessions.findIndex((s) => s.session === sessionName) - 1;
            const prevSession =
              prevSessionIndex >= 0 ? umsData.sessions[prevSessionIndex] : null;
            const prevUMS =
              prevSession?.data.find((d) => d.RAW === i)?.UMS ?? null;

            point[sessionName] = currentUMS;
            point[`${sessionName}_change`] =
              prevUMS !== null && currentUMS !== null
                ? currentUMS - prevUMS
                : null;

            const record = sessionData?.data.find((d) => d.RAW === i);
            if (record?.GRADE) {
              point[`${sessionName}_grade`] = record.GRADE;
            }
          });

          return point;
        });
      })();

      // Calculate grade distribution data
      const gradeDistData: GradeDistribution[] = (() => {
        const gradeMap = new Map<string, GradeDistribution>();

        selectedSessions.forEach((session) => {
          const sessionData =
            umsData.sessions.find((s) => s.session === session)?.data || [];
          sessionData.forEach((record) => {
            if (!record.GRADE) return;

            if (!gradeMap.has(record.GRADE)) {
              gradeMap.set(record.GRADE, { grade: record.GRADE });
            }
            const gradeData = gradeMap.get(record.GRADE)!;
            gradeData[session] = record.RAW;
          });
        });

        return Array.from(gradeMap.values()).sort((a, b) => {
          const gradeOrder = ["A*", "A", "B", "C", "D", "E", "U"];
          return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
        });
      })();

      // Extract grade boundaries across sessions
      const gradeBoundaryData: GradeBoundaryTrend[] = (() => {
        // Define the grades we're interested in
        const gradesOfInterest = ["A*", "*", "A", "B", "C", "D", "E", "U"];

        // Create a map to track lowest raw mark for each grade in each session
        const gradeBoundariesMap = new Map<string, Map<string, number>>();

        // Initialize with all grades of interest
        gradesOfInterest.forEach((grade) => {
          gradeBoundariesMap.set(grade, new Map<string, number>());
        });

        // Add "Full UMS" as a special category
        gradeBoundariesMap.set("Full UMS", new Map<string, number>());

        // Process each session
        selectedSessions.forEach((sessionName) => {
          const sessionData =
            umsData.sessions.find((s) => s.session === sessionName)?.data || [];

          // Find max UMS for the session
          const maxUms = Math.max(...sessionData.map((d) => d.UMS));

          // Find the minimum raw mark needed for max UMS
          const maxUmsEntries = sessionData.filter(
            (entry) => entry.UMS === maxUms,
          );
          if (maxUmsEntries.length > 0) {
            const minFullUmsRaw = Math.min(
              ...maxUmsEntries.map((entry) => entry.RAW),
            );
            gradeBoundariesMap.get("Full UMS")?.set(sessionName, minFullUmsRaw);
          }

          // Process each grade
          gradesOfInterest.forEach((grade) => {
            // Find all records with this grade
            const gradeRecords = sessionData.filter(
              (record) => record.GRADE === grade,
            );

            // If we have records for this grade, find the minimum raw mark required
            if (gradeRecords.length > 0) {
              const minRawForGrade = Math.min(
                ...gradeRecords.map((record) => record.RAW),
              );
              gradeBoundariesMap.get(grade)?.set(sessionName, minRawForGrade);
            }
          });
        });

        // Convert the map to array format for the chart
        const result: GradeBoundaryTrend[] = [];

        // Add Full UMS first
        const fullUmsData = Array.from(
          gradeBoundariesMap.get("Full UMS")?.entries() || [],
        ).map(([session, raw]) => ({ session, raw }));

        if (fullUmsData.length > 0) {
          result.push({
            grade: "Full UMS",
            data: fullUmsData,
            color: GRADE_COLORS["Full UMS"],
          });
        }

        // Add A* (which could be stored as either "A*" or "*")
        const aStarData = new Map<string, number>();

        // Check for "*" notation first
        gradeBoundariesMap.get("*")?.forEach((raw, session) => {
          aStarData.set(session, raw);
        });

        // Then check for "A*" notation (overriding "*" if both exist)
        gradeBoundariesMap.get("A*")?.forEach((raw, session) => {
          aStarData.set(session, raw);
        });

        if (aStarData.size > 0) {
          result.push({
            grade: "A*",
            data: Array.from(aStarData.entries()).map(([session, raw]) => ({
              session,
              raw,
            })),
            color: GRADE_COLORS["A*"],
          });
        }

        // Add remaining grades
        ["A", "B", "C", "D", "E", "U"].forEach((grade) => {
          const gradeData = Array.from(
            gradeBoundariesMap.get(grade)?.entries() || [],
          ).map(([session, raw]) => ({ session, raw }));

          if (gradeData.length > 0) {
            result.push({
              grade,
              data: gradeData,
              color: GRADE_COLORS[grade],
            });
          }
        });

        return result;
      })();

      const commonOptions: EChartsOption = {
        animation: true,
        animationDuration: 600,
        animationEasing: "cubicOut",
        grid: {
          top: 70,
          right: 50,
          bottom: 110,
          left: 70,
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "rgba(0, 0, 0, 0.1)",
          padding: [12, 16],
          textStyle: {
            color: "#1f2937",
            fontSize: 13,
          },
          extraCssText: "box-shadow: 0 8px 32px rgba(0,0,0,0.12); backdrop-filter: blur(8px); z-index: 9999 !important;",
          appendToBody: true,
          confine: false,
        },
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 100,
          },
          {
            type: "slider",
            show: true,
            start: 0,
            end: 100,
            bottom: 8,
            height: 18,
            handleSize: 16,
            borderRadius: 4,
          },
        ],
        legend: {
          bottom: 45,
          formatter: formatSessionName,
          itemGap: 24,
          itemWidth: 16,
          itemHeight: 16,
          textStyle: {
            fontSize: 12,
            color: "#64748B",
            fontWeight: 500,
          },
        },
      };

      // Create chart options based on view type
      const options: EChartsOption =
        viewType === VIEW_TYPES.GRADE_DIST
          ? {
              ...commonOptions,
              xAxis: {
                type: "category",
                data: gradeDistData.map((d) => d.grade),
                axisLabel: {
                  interval: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                },
                axisLine: {
                  lineStyle: {
                    color: "#E5E7EB",
                  },
                },
              },
              yAxis: {
                type: "value",
                name: "Raw Mark",
                nameLocation: "middle",
                nameGap: 50,
                nameTextStyle: {
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                },
                splitLine: {
                  lineStyle: {
                    type: "dashed",
                    color: "#F3F4F6",
                  },
                },
                axisLabel: {
                  fontSize: 12,
                  color: "#6B7280",
                },
              },
              series: selectedSessions.map((session, index) => {
                const sessionIndex = sortedSessions.indexOf(session);
                return {
                  name: session,
                  type: "bar",
                  data: gradeDistData.map((d) => d[session]),
                  itemStyle: {
                    color: SESSION_COLORS[sessionIndex % SESSION_COLORS.length],
                    borderRadius: [6, 6, 0, 0],
                  },
                  emphasis: {
                    itemStyle: {
                      borderWidth: 2,
                      borderColor: "#ffffff",
                      shadowBlur: 15,
                      shadowOffsetX: 0,
                      shadowOffsetY: 4,
                      shadowColor: "rgba(0, 0, 0, 0.2)",
                    },
                  },
                };
              }),
              tooltip: {
                ...commonOptions.tooltip,
                formatter: (params: any) => {
                  if (!Array.isArray(params)) return "";

                  const grade = params[0].name;
                  let content = `<div style="font-weight: 600; margin-bottom: 10px; color: #111827;">Grade: ${grade}</div>`;

                  params.forEach((param: any) => {
                    const sessionName = param.seriesName;
                    const rawMark = param.value;
                    const color = param.color;

                    content += `
                <div style="margin-top: 10px; display: flex; align-items: center;">
                  <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${color}; margin-right: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></span>
                  <span style="font-weight: 500; color: ${color}; margin-right: 8px;">${formatSessionName(sessionName)}</span>
                  <span style="color: #6B7280;">Raw Mark: <strong style="color: #111827;">${rawMark !== undefined ? rawMark : "N/A"}</strong></span>
                </div>
              `;
                  });

                  return content;
                },
              },
            }
          : viewType === VIEW_TYPES.GRADE_BOUNDS
            ? {
                ...commonOptions,
                xAxis: {
                  type: "category",
                  data: selectedSessions.map(formatSessionName),
                  axisLabel: {
                    interval: 0,
                    fontSize: 12,
                    rotate: 45,
                    align: "right",
                    color: "#6B7280",
                  },
                  axisLine: {
                    lineStyle: {
                      color: "#E5E7EB",
                    },
                  },
                },
                yAxis: {
                  type: "value",
                  name: "Raw Mark",
                  nameLocation: "middle",
                  nameGap: 50,
                  nameTextStyle: {
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                  },
                  splitLine: {
                    lineStyle: {
                      type: "dashed",
                      color: "#F3F4F6",
                    },
                  },
                  axisLabel: {
                    fontSize: 12,
                    color: "#6B7280",
                  },
                },
                series: gradeBoundaryData.map((boundary) => ({
                  name: boundary.grade,
                  type: "line",
                  data: selectedSessions.map((session) => {
                    const dataPoint = boundary.data.find(
                      (d) => d.session === session,
                    );
                    return dataPoint ? dataPoint.raw : null;
                  }),
                  symbolSize: 10,
                  lineStyle: {
                    width: 3,
                    color: boundary.color,
                  },
                  itemStyle: {
                    color: boundary.color,
                    borderWidth: 2,
                    borderColor: "#ffffff",
                  },
                  smooth: false,
                  connectNulls: false,
                  emphasis: {
                    focus: "series",
                    lineStyle: {
                      width: 4,
                    },
                    itemStyle: {
                      shadowBlur: 10,
                      shadowColor: boundary.color,
                      borderWidth: 3,
                    },
                    label: {
                      show: true,
                      formatter: "{c}",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#ffffff",
                      backgroundColor: boundary.color,
                      padding: [4, 8],
                      borderRadius: 4,
                      position: "top",
                      distance: 10,
                    },
                  },
                  label: {
                    show: false,
                  },
                })),
                tooltip: {
                  ...commonOptions.tooltip,
                  formatter: (params: any) => {
                    if (!Array.isArray(params)) return "";

                    const sessionName = params[0].name;
                    let content = `<div style="font-weight: 600; margin-bottom: 10px; color: #111827;">${sessionName}</div>`;

                    params.forEach((param: any) => {
                      const grade = param.seriesName;
                      const rawMark = param.value;
                      const color = param.color;

                      if (rawMark !== null && rawMark !== undefined) {
                        content += `
                  <div style="margin-top: 10px; display: flex; align-items: center;">
                    <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${color}; margin-right: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></span>
                    <span style="font-weight: 500; color: ${color}; margin-right: 8px;">${grade}</span>
                    <span style="color: #6B7280;">Raw Mark: <strong style="color: #111827;">${rawMark}</strong></span>
                  </div>
                `;
                      }
                    });

                    return content;
                  },
                },
                legend: {
                  ...commonOptions.legend,
                  formatter: (name: string) => name,
                },
              }
            : {
                ...commonOptions,
                xAxis: {
                  type: "value",
                  name: "Raw Mark",
                  nameLocation: "middle",
                  nameGap: 55,
                  nameTextStyle: {
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                  },
                  min: 0,
                  max: "dataMax",
                  splitLine: {
                    lineStyle: {
                      type: "dashed",
                      color: "#F3F4F6",
                    },
                  },
                  axisLabel: {
                    fontSize: 12,
                    color: "#6B7280",
                  },
                },
                yAxis: {
                  type: "value",
                  name: "UMS",
                  nameLocation: "middle",
                  nameGap: 50,
                  nameTextStyle: {
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                  },
                  splitLine: {
                    lineStyle: {
                      type: "dashed",
                      color: "#F3F4F6",
                    },
                  },
                  axisLabel: {
                    fontSize: 12,
                    color: "#6B7280",
                  },
                },
                series: selectedSessions.map((session, index) => {
                  const sessionIndex = sortedSessions.indexOf(session);
                  return {
                    name: session,
                    type: "line",
                    smooth: true,
                    symbol: "circle",
                    symbolSize: 3,
                    sampling: "average",
                    data: chartData.map((point) => [point.raw, point[session]]),
                    lineStyle: {
                      color: SESSION_COLORS[sessionIndex % SESSION_COLORS.length],
                      width: 2.5,
                    },
                    emphasis: {
                      focus: "series",
                      lineStyle: {
                        width: 3.5,
                      },
                      itemStyle: {
                        borderWidth: 3,
                        shadowBlur: 8,
                      },
                    },
                    markPoint: {
                      data: [
                        { type: "max", name: "Max", symbolSize: 50 },
                        { type: "min", name: "Min", symbolSize: 50 },
                      ],
                      label: {
                        fontSize: 11,
                        fontWeight: 600,
                      },
                      itemStyle: {
                        shadowBlur: 5,
                        shadowColor: "rgba(0,0,0,0.2)",
                      },
                    },
                    areaStyle: {
                      color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                          {
                            offset: 0,
                            color:
                              SESSION_COLORS[sessionIndex % SESSION_COLORS.length] +
                              "25", // 25% opacity
                          },
                          {
                            offset: 1,
                            color:
                              SESSION_COLORS[sessionIndex % SESSION_COLORS.length] +
                              "00", // 0% opacity
                          },
                        ],
                      },
                    },
                  };
                }),
                tooltip: {
                  ...commonOptions.tooltip,
                  formatter: (params: any) => {
                    if (!Array.isArray(params)) return "";

                    const raw = params[0]?.value?.[0];
                    if (raw === undefined) return "";

                    let content = `<div style="font-weight: 600; margin-bottom: 10px; color: #111827;">Raw Mark: ${raw}</div>`;

                    params.forEach((param: any) => {
                      if (!param.value) return;

                      const sessionName = param.seriesName;
                      const ums = param.value[1];
                      const grade = chartData[raw]?.[`${sessionName}_grade`];
                      const color = param.color;

                      content += `
                <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; align-items: center;">
                    <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${color}; margin-right: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></span>
                    <span style="font-weight: 500; color: ${color};">${formatSessionName(sessionName)}</span>
                  </div>
                  <div style="padding-left: 20px; color: #6B7280;">
                    UMS: <strong style="color: #111827;">${ums ?? "N/A"}</strong>
                    ${grade ? `<br>Grade: <strong style="color: #111827;">${grade}</strong>` : ""}
                  </div>
                </div>
              `;
                    });

                    return content;
                  },
                },
              };

      return { chartData, gradeDistData, gradeBoundaryData, options };
    }, [umsData, selectedSessions, viewType, sortedSessions]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="h-12 w-36 bg-surface-alt rounded-lg animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-10 w-40 bg-surface-alt rounded-lg animate-pulse"></div>
              <div className="h-10 w-40 bg-surface-alt rounded-lg animate-pulse"></div>
              <div className="h-10 w-44 bg-surface-alt rounded-lg animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[450px] bg-surface-alt rounded-lg animate-pulse mb-8"></div>
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="h-10 w-28 bg-surface-alt rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-surface-alt rounded-lg animate-pulse"></div>
            <div className="h-10 w-30 bg-surface-alt rounded-lg animate-pulse"></div>
            <div className="h-10 w-28 bg-surface-alt rounded-lg animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subject || !unit) {
    return (
      <Card>
        <CardContent className="py-16">
          <div className="text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-surface-alt rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-text-muted"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text mb-3">
              No Unit Selected
            </h3>
            <p className="text-text-muted leading-relaxed">
              Please select a subject and unit from the dropdown menu to view
              UMS conversion charts and grade boundary analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!umsData || !umsData.sessions.length) {
    return (
      <Card>
        <CardContent className="py-16">
          <div className="text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-surface-alt rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-text-muted"
              >
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22,2 15,22 11,13 2,9 22,2"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text mb-3">
              No Data Available
            </h3>
            <p className="text-text-muted leading-relaxed">
              No UMS conversion data is currently available for this unit.
              Data may be added in future updates.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Card>
        {/* Header with Unit Info and View Selector */}
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          {/* Unit Info */}
          <UnitSelector unit={unit} subject={subject} />

          {/* View Type Selector */}
          <div
            role="tablist"
            className="flex gap-2 p-2 bg-background rounded-xl shadow-sm border border-border/50"
          >
            <TabButton
              active={viewType === VIEW_TYPES.GRADE_BOUNDS}
              onClick={() => {
                setViewType(VIEW_TYPES.GRADE_BOUNDS);
                window.history.replaceState(null, "", `?view=grade-bounds`);
              }}
              role="tab"
              aria-selected={viewType === VIEW_TYPES.GRADE_BOUNDS}
            >
              Grade Boundaries
            </TabButton>
            <TabButton
              active={viewType === VIEW_TYPES.GRADE_DIST}
              onClick={() => {
                setViewType(VIEW_TYPES.GRADE_DIST);
                window.history.replaceState(null, "", `?view=grade-dist`);
              }}
              role="tab"
              aria-selected={viewType === VIEW_TYPES.GRADE_DIST}
            >
              Grade Distribution
            </TabButton>
            <TabButton
              active={viewType === VIEW_TYPES.SESSION_COMP}
              onClick={() => {
                setViewType(VIEW_TYPES.SESSION_COMP);
                window.history.replaceState(null, "", `?view=session-comp`);
              }}
              role="tab"
              aria-selected={viewType === VIEW_TYPES.SESSION_COMP}
            >
              Session Comparison
            </TabButton>
          </div>
        </CardHeader>

        {/* Chart View */}
        <div className="p-6 pb-0">
          {/* Tip Banner for Grade Boundaries view */}
          {viewType === VIEW_TYPES.GRADE_BOUNDS && (
            <TipBanner>
              <strong>Tip:</strong> Hover over the chart lines to see the exact raw marks required for each grade boundary in different exam sessions.
            </TipBanner>
          )}
        </div>

        <div className="h-[450px] p-6 relative overflow-hidden border-b border-border/50">
          {options ? (
            <ReactECharts
              option={options}
              style={{ height: "100%", width: "100%" }}
              className="transition-all duration-500"
              opts={{ renderer: "svg" }}
              notMerge={true}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3 text-text-muted/80">
                <div className="w-12 h-12 bg-surface-alt rounded-full mx-auto flex items-center justify-center">
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
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <p className="text-lg font-medium">No chart data available</p>
                <p className="text-sm">
                  Please select at least one session to display data
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Session Selection */}
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-semibold">Exam Sessions</h3>
            <div className="text-sm text-text-muted">
              {selectedSessions.length} of {sortedSessions.length} sessions selected
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-6 transition-all">
            {sortedSessions.map((session, index) => {
              const sessionData = umsData.sessions.find(
                (s) => s.session === session,
              );
              return (
                <SessionButton
                  key={session}
                  session={session}
                  selected={selectedSessions.includes(session)}
                  color={SESSION_COLORS[index % SESSION_COLORS.length]}
                  metadata={
                    sessionData?.metadata || { recordCount: 0, timestamp: "" }
                  }
                  onClick={() => {
                    setSelectedSessions((prev) =>
                      prev.includes(session)
                        ? prev.filter((s) => s !== session)
                        : [...prev, session],
                    );
                  }}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-border/50">
            <ActionButton
              onClick={() => setSelectedSessions(sortedSessions)}
              variant="primary"
            >
              Select all
            </ActionButton>
            <ActionButton
              onClick={() => setSelectedSessions([])}
              variant="secondary"
            >
              Clear selection
            </ActionButton>
            <ActionButton
              onClick={() => setSelectedSessions(sortedSessions.slice(0, 3))}
              variant="secondary"
            >
              Latest 3 sessions
            </ActionButton>
          </div>
        </CardContent>
      </Card>

      {/* Metadata Card */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            Dataset Information
          </h3>
        </CardHeader>
        <CardContent className="bg-surface/20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-1">
              <span className="block text-text-muted text-sm font-medium">
                Subject
              </span>
              <span className="font-semibold text-lg">{subject?.name}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-text-muted text-sm font-medium">Unit</span>
              <span className="font-semibold text-lg">{unit?.name}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-text-muted text-sm font-medium">
                Papers Found
              </span>
              <span className="font-semibold text-lg">{umsData?.total_papers_found}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-text-muted text-sm font-medium">
                Available Sessions
              </span>
              <span className="font-semibold text-lg">{umsData?.sessions.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}