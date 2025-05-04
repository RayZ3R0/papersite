"use client";

import { Subject, Unit, UMSData } from "@/types/ums";
import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Brush,
  BarChart,
  Bar,
} from "recharts";

interface UMSChartProps {
  subject?: Subject;
  unit?: Unit;
  umsData?: UMSData;
  loading?: boolean;
}

const VIEW_TYPES = {
  GRADE_DIST: "grade-dist",
  SESSION_COMP: "session-comp",
} as const;

type ViewType = typeof VIEW_TYPES[keyof typeof VIEW_TYPES];

interface ChartDataPoint {
  raw: number;
  [key: string]: number | string | null;
}

interface GradeDistribution {
  grade: string;
  [key: string]: string | number;
}

const SESSION_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
];

const getChangeColor = (change: number | null) => {
  if (change === null) return '';
  return change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : '';
};

const formatChange = (change: number | null) => {
  if (change === null) return '';
  return `${change > 0 ? '+' : ''}${change}`;
};

// Format session name (e.g., "January_2025" -> "January 2025")
const formatSessionName = (session: string): string => {
  return session.replace(/_/g, ' ');
};

const TabButton = ({
  active,
  onClick,
  children,
  role,
  "aria-selected": ariaSelected
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
    className={`px-4 py-2 rounded-lg transition-all ${
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "bg-surface hover:bg-surface-alt"
    }`}
  >
    {children}
  </button>
);

const UnitSelector = ({ unit, subject }: { unit: Unit; subject: Subject }) => (
  <div className="relative group">
    <div
      className="px-4 py-2 rounded-lg bg-surface border border-border hover:bg-surface-alt transition-colors"
      role="button"
      aria-haspopup="true"
      aria-expanded="false"
    >
      <span className="font-mono font-medium text-lg">{unit.id}</span>
    </div>
    <div
      className="absolute z-10 left-0 top-full mt-1 hidden group-hover:block w-[300px]"
      role="tooltip"
    >
      <div className="bg-white dark:bg-gray-800 text-popover-foreground p-3 rounded-lg shadow-lg">
        <div className="border-b border-border pb-2 mb-2">
          <h4 className="font-medium text-base">{subject.name}</h4>
          <p className="text-sm text-text-muted mt-1">{unit.name}</p>
        </div>
        {unit.description && (
          <p className="text-sm text-text-muted">{unit.description}</p>
        )}
      </div>
    </div>
  </div>
);

export default function UMSChart({ subject, unit, umsData, loading = false }: UMSChartProps) {
  const [selectedSessions, setSelectedSessions] = useState<string[]>(
    umsData?.sessions.map(s => s.session) || []
  );
  const [viewType, setViewType] = useState<ViewType>(VIEW_TYPES.GRADE_DIST);
  const [focusedPoint, setFocusedPoint] = useState<null | { raw: number; session: string }>(null);

  // Raw to UMS correlation data
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!umsData || !selectedSessions.length) return [];

    const maxRaw = Math.max(
      ...umsData.sessions.flatMap(session => session.data).map(record => record.RAW)
    );

    return Array.from({ length: maxRaw + 1 }, (_, i) => {
      const point: ChartDataPoint = { raw: i };

      selectedSessions.forEach((sessionName) => {
        const sessionData = umsData.sessions.find(s => s.session === sessionName);
        const currentUMS = sessionData?.data.find((d) => d.RAW === i)?.UMS ?? null;
        
        const prevSessionIndex = umsData.sessions.findIndex(s => s.session === sessionName) - 1;
        const prevSession = prevSessionIndex >= 0 ? umsData.sessions[prevSessionIndex] : null;
        const prevUMS = prevSession?.data.find(d => d.RAW === i)?.UMS ?? null;
        
        point[sessionName] = currentUMS;
        point[`${sessionName}_change`] = prevUMS !== null && currentUMS !== null ? currentUMS - prevUMS : null;
        
        const record = sessionData?.data.find(d => d.RAW === i);
        if (record?.GRADE) {
          point[`${sessionName}_grade`] = record.GRADE;
        }
      });

      return point;
    });
  }, [umsData, selectedSessions]);

  // Grade boundary data showing raw marks for each grade
  const gradeDistData = useMemo(() => {
    if (!umsData || !selectedSessions.length) return [];

    // Map of arrays to hold raw marks for each grade
    const gradeMap = new Map<string, { grade: string; [key: string]: string | number }>();

    selectedSessions.forEach(session => {
      const sessionData = umsData.sessions.find(s => s.session === session)?.data || [];
      sessionData.forEach(record => {
        if (!record.GRADE) return;

        if (!gradeMap.has(record.GRADE)) {
          gradeMap.set(record.GRADE, { grade: record.GRADE });
        }
        const gradeData = gradeMap.get(record.GRADE)!;
        // Store raw marks for each session
        gradeData[session] = record.RAW;
      });
    });

    return Array.from(gradeMap.values()).sort((a, b) => {
      const gradeOrder = ['A*', 'A', 'B', 'C', 'D', 'E', 'U'];
      return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
    });
  }, [umsData, selectedSessions]);

  // Extract grade boundaries
  const gradeBoundaries = useMemo(() => {
    if (!umsData) return {};

    return umsData.sessions.reduce((acc, session) => {
      const boundaries = session.data.reduce((bounds, record) => {
        if (record.GRADE && !bounds[record.GRADE]) {
          bounds[record.GRADE] = record.RAW;
        }
        return bounds;
      }, {} as { [grade: string]: number });

      acc[session.session] = boundaries;
      return acc;
    }, {} as { [session: string]: { [grade: string]: number } });
  }, [umsData]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-96 bg-surface-alt rounded-lg"></div>
        <div className="h-12 bg-surface-alt rounded"></div>
      </div>
    );
  }

  if (!subject || !unit) {
    return (
      <div className="text-center p-8 bg-surface rounded-lg border border-border">
        <h3 className="text-lg font-medium text-text mb-2">No Unit Selected</h3>
        <p className="text-text-muted">
          Please select a subject and unit to view UMS conversion charts.
        </p>
      </div>
    );
  }

  if (!umsData || !umsData.sessions.length) {
    return (
      <div className="text-center p-8 bg-surface rounded-lg border border-border">
        <h3 className="text-lg font-medium text-text mb-2">No Data Available</h3>
        <p className="text-text-muted">
          No UMS conversion data available for this unit.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Unit Info and View Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Unit Info */}
        <UnitSelector unit={unit} subject={subject} />
        
        {/* View Type Selector */}
        <div role="tablist" className="flex gap-2">
          <TabButton
            active={viewType === VIEW_TYPES.GRADE_DIST}
            onClick={() => {
              setViewType(VIEW_TYPES.GRADE_DIST);
              window.history.replaceState(null, '', `?view=grade-dist`);
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
              window.history.replaceState(null, '', `?view=session-comp`);
            }}
            role="tab"
            aria-selected={viewType === VIEW_TYPES.SESSION_COMP}
          >
            Session Comparison
          </TabButton>
        </div>
      </div>

      {/* Chart View */}
      <div className="h-96 bg-surface rounded-lg border border-border p-4">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === VIEW_TYPES.GRADE_DIST ? (
            <BarChart 
              data={gradeDistData}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }} // Added bottom margin
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="grade" 
                height={50} // Increased height to avoid overlap
              />
              <YAxis
                label={{ value: "Raw Mark", angle: -90, position: "left" }}
                domain={[0, 'dataMax']}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-800 text-popover-foreground p-3 rounded shadow-lg space-y-2">
                        <p className="font-medium border-b pb-1">Grade: {label}</p>
                        <div className="space-y-1">
                          {payload.map((entry: any) => (
                            <div key={entry.dataKey} style={{ color: entry.color }}>
                              <p className="font-medium">{formatSessionName(entry.dataKey)} Session</p>
                              <p>{`Raw Mark: ${entry.value}`}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                formatter={(value) => formatSessionName(value)}
                wrapperStyle={{ paddingTop: "10px" }}
              />
              {selectedSessions.map((session, index) => (
                <Bar
                  key={session}
                  dataKey={session}
                  fill={SESSION_COLORS[index % SESSION_COLORS.length]}
                  name={`${session} Session`}
                />
              ))}
            </BarChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }} // Added bottom margin
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="raw"
                label={{ value: "Raw Mark", position: "insideBottom", offset: -15 }}
                height={50} // Increased height to avoid overlap
              />
              <YAxis
                label={{ value: "UMS", angle: -90, position: "left" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-800 text-popover-foreground p-3 rounded shadow-lg space-y-2">
                        <p className="font-medium border-b pb-1">Raw Mark: {label}</p>
                        <div className="space-y-1">
                          {payload.map((entry: any) => {
                            if (entry.dataKey.includes('_change') || entry.dataKey.includes('_grade')) return null;
                            
                            const sessionName = entry.dataKey;
                            const point = chartData[label as number];
                            const grade = point[`${sessionName}_grade`];
                            
                            return (
                              <div key={entry.dataKey} style={{ color: entry.color }}>
                                <p className="font-medium">{formatSessionName(sessionName)} Session</p>
                                <p>{`UMS: ${entry.value ?? "N/A"}`}</p>
                                {grade && <p>{`Grade: ${grade}`}</p>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
                <Legend 
    formatter={(value) => formatSessionName(value)}
    wrapperStyle={{ 
      paddingTop: "1px",  // Increased padding at top to push legend down
      bottom: 30,           // Ensure it's at the bottom
      position: "relative" // Add position relative
    }}
    verticalAlign="bottom" // Align at bottom
  />
              {selectedSessions.map((session, index) => (
                <Line
                  key={session}
                  type="monotone"
                  dataKey={session}
                  stroke={SESSION_COLORS[index % SESSION_COLORS.length]}
                  name={`${session}`}
                  dot={false}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Session Selection */}
      <div className="flex flex-wrap gap-2">
        {umsData.sessions.map((session, index) => (
          <div key={session.session} className="relative group">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedSessions.includes(session.session)
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface hover:bg-surface-alt"
              }`}
              style={{
                borderColor: SESSION_COLORS[index % SESSION_COLORS.length],
                borderWidth: 1,
              }}
              onClick={() => {
                setSelectedSessions((prev) =>
                  prev.includes(session.session)
                    ? prev.filter((s) => s !== session.session)
                    : [...prev, session.session]
                );
              }}
            >
              {formatSessionName(session.session)}
            </button>
            <div className="absolute z-10 left-0 top-full mt-1 hidden group-hover:block">
              <div className="bg-white dark:bg-gray-800 text-popover-foreground p-3 rounded-lg shadow-lg">
                <p className="text-sm">
                  Papers: {session.metadata.recordCount}
                </p>
                <p className="text-xs text-text-muted">
                  {session.metadata.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Metadata */}
      <div className="text-sm text-text-muted">
        <div>Subject: {subject.name}</div>
        <div>Unit: {unit.name}</div>
        <div>Total Papers Found: {umsData.total_papers_found}</div>
        <div>Available Sessions: {umsData.sessions.length}</div>
      </div>
    </div>
  );
}