"use client";

import { Subject, Unit, UMSData } from "@/types/ums";
import { useMemo, useState, useEffect } from "react";
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

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
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#6366F1", // Indigo
  "#D946EF", // Fuchsia
];

const getChangeColor = (change: number | null) => {
  if (change === null) return '';
  return change > 0 ? 'text-emerald-500' : change < 0 ? 'text-rose-500' : '';
};

const formatChange = (change: number | null) => {
  if (change === null) return '';
  return `${change > 0 ? '+' : ''}${change}`;
};

// Format session name (e.g., "January_2025" -> "January 2025")
const formatSessionName = (session: string): string => {
  return session.replace(/_/g, ' ');
};

// Sort sessions chronologically (newest first)
const sortSessions = (sessions: string[]): string[] => {
  return [...sessions].sort((a, b) => {
    // Extract month and year from session name
    const [monthA, yearA] = a.split('_');
    const [monthB, yearB] = b.split('_');
    
    // Compare years first (higher year first for reverse chronological order)
    if (yearA !== yearB) return parseInt(yearB, 10) - parseInt(yearA, 10);
    
    // If years are the same, compare months
    const monthOrder = {
      'January': 1,
      'March': 3, 
      'May': 5,
      'June': 6,
      'August': 8,
      'October': 10,
      'November': 11
    };
    
    return (monthOrder[monthB as keyof typeof monthOrder] || 0) - 
           (monthOrder[monthA as keyof typeof monthOrder] || 0);
  });
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
    className={`px-4 py-2 rounded-lg font-medium transition-all ${
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
      <div className="bg-white dark:bg-gray-800 text-popover-foreground p-4 rounded-lg shadow-lg">
        <div className="border-b border-border pb-2 mb-2">
          <h4 className="font-medium text-lg">{subject.name}</h4>
          <p className="text-sm text-text-muted mt-1">{unit.name}</p>
        </div>
        {unit.description && (
          <p className="text-sm text-text-muted leading-relaxed">{unit.description}</p>
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
  metadata 
}: { 
  session: string; 
  selected: boolean; 
  color: string;
  onClick: () => void;
  metadata: { recordCount: number; timestamp: string };
}) => (
  <div className="relative group">
    <button
      className={`px-4 py-2 rounded-lg transition-all ${
        selected
          ? "bg-primary/10 text-primary-foreground shadow-sm"
          : "bg-surface hover:bg-surface-alt"
      }`}
      style={{
        borderColor: color,
        borderWidth: 2,
        borderStyle: "solid",
        color: selected ? color : undefined,
        fontWeight: selected ? 500 : 400
      }}
      onClick={onClick}
      aria-pressed={selected}
    >
      {formatSessionName(session)}
    </button>
    <div className="absolute z-10 left-0 top-full mt-2 hidden group-hover:block">
      <div className="bg-white dark:bg-gray-800 text-popover-foreground p-3 rounded-lg shadow-lg min-w-[160px]">
        <div className="font-medium mb-1" style={{ color }}>
          {formatSessionName(session)}
        </div>
        <p className="text-xs text-text-muted mt-1">
          {metadata.timestamp}
        </p>
      </div>
    </div>
  </div>
);

export default function UMSChart({ subject, unit, umsData, loading = false }: UMSChartProps) {
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [viewType, setViewType] = useState<ViewType>(VIEW_TYPES.GRADE_DIST);
  const [focusedPoint, setFocusedPoint] = useState<null | { raw: number; session: string }>(null);
  
  // Sort sessions and set initial selection when umsData changes
  useEffect(() => {
    if (umsData?.sessions) {
      const sortedSessions = sortSessions(umsData.sessions.map(s => s.session));
      // Initially select the latest 3 sessions or all if less than 3
      setSelectedSessions(sortedSessions.slice(0, Math.min(3, sortedSessions.length)));
    }
  }, [umsData]);

  // Get URL parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const view = searchParams.get('view');
    if (view === 'grade-dist' || view === 'session-comp') {
      setViewType(view);
    }
  }, []);

  // Memoize all chart data and options
  const { chartData, gradeDistData, options } = useMemo(() => {
    if (!umsData || !selectedSessions.length) {
      return {
        chartData: [],
        gradeDistData: [],
        options: null as EChartsOption | null
      };
    }

    // Calculate chart data
    const chartData: ChartDataPoint[] = (() => {
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
    })();

    // Calculate grade distribution data
    const gradeDistData: GradeDistribution[] = (() => {
      const gradeMap = new Map<string, GradeDistribution>();

      selectedSessions.forEach(session => {
        const sessionData = umsData.sessions.find(s => s.session === session)?.data || [];
        sessionData.forEach(record => {
          if (!record.GRADE) return;

          if (!gradeMap.has(record.GRADE)) {
            gradeMap.set(record.GRADE, { grade: record.GRADE });
          }
          const gradeData = gradeMap.get(record.GRADE)!;
          gradeData[session] = record.RAW;
        });
      });

      return Array.from(gradeMap.values()).sort((a, b) => {
        const gradeOrder = ['A*', 'A', 'B', 'C', 'D', 'E', 'U'];
        return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
      });
    })();

    // Common chart options
    const commonOptions: EChartsOption = {
      animation: true,
      animationDuration: 500,
      grid: {
        top: 60,
        right: 40,
        bottom: 80,
        left: 60,
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 8,
        borderWidth: 1,
        padding: 12,
        textStyle: {
          color: '#1f2937'
        },
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15);'
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          type: 'slider',
          show: true,
          start: 0,
          end: 100,
          bottom: 5
        }
      ],
      legend: {
        bottom: 35,
        formatter: formatSessionName,
        itemGap: 20,
        textStyle: {
          fontSize: 12
        }
      }
    };

    // Create chart options based on view type
    const options: EChartsOption = viewType === VIEW_TYPES.GRADE_DIST ? {
      ...commonOptions,
      xAxis: {
        type: 'category',
        data: gradeDistData.map(d => d.grade),
        axisLabel: { 
          interval: 0,
          fontSize: 12,
          fontWeight: 'bold'
        }
      },
      yAxis: {
        type: 'value',
        name: 'Raw Mark',
        nameLocation: 'middle',
        nameGap: 40,
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      series: selectedSessions.map((session, index) => ({
        name: session,
        type: 'bar',
        data: gradeDistData.map(d => d[session]),
        itemStyle: {
          color: SESSION_COLORS[index % SESSION_COLORS.length],
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            borderWidth: 1,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      })),
      tooltip: {
        ...commonOptions.tooltip,
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          
          const grade = params[0].name;
          let content = `<div style="font-weight: 500; margin-bottom: 8px;">Grade: ${grade}</div>`;
          
          params.forEach((param: any) => {
            const sessionName = param.seriesName;
            const rawMark = param.value;
            const color = param.color;
            
            content += `
              <div style="margin-top: 8px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; margin-right: 6px;"></span>
                <span style="font-weight: 500; color: ${color};">${formatSessionName(sessionName)}</span>
                <div style="padding-left: 16px;">Raw Mark: ${rawMark !== undefined ? rawMark : 'N/A'}</div>
              </div>
            `;
          });
          
          return content;
        }
      }
    } : {
      ...commonOptions,
      xAxis: {
        type: 'value',
        name: 'Raw Mark',
        nameLocation: 'middle',
        nameGap: 30,
        min: 0,
        max: 'dataMax',
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'UMS',
        nameLocation: 'middle',
        nameGap: 40,
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      series: selectedSessions.map((session, index) => ({
        name: session,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 2,
        sampling: 'average',
        data: chartData.map(point => [point.raw, point[session]]),
        lineStyle: {
          color: SESSION_COLORS[index % SESSION_COLORS.length],
          width: 2
        },
        emphasis: {
          focus: 'series',
          lineStyle: {
            width: 3
          },
          itemStyle: {
            borderWidth: 2
          }
        },
        markPoint: {
          data: [
            { type: 'max', name: 'Max', symbolSize: 60 },
            { type: 'min', name: 'Min', symbolSize: 60 }
          ],
          label: {
            fontSize: 12
          }
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, 
              color: SESSION_COLORS[index % SESSION_COLORS.length] + '20' // 20% opacity
            }, {
              offset: 1, 
              color: SESSION_COLORS[index % SESSION_COLORS.length] + '00' // 0% opacity
            }]
          }
        }
      })),
      tooltip: {
        ...commonOptions.tooltip,
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          
          const raw = params[0]?.value?.[0];
          if (raw === undefined) return '';
          
          let content = `<div style="font-weight: 500; margin-bottom: 8px;">Raw Mark: ${raw}</div>`;
          
          params.forEach((param: any) => {
            if (!param.value) return;
            
            const sessionName = param.seriesName;
            const ums = param.value[1];
            const grade = chartData[raw]?.[`${sessionName}_grade`];
            const color = param.color;
            
            content += `
              <div style="margin-top: 8px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; margin-right: 6px;"></span>
                <span style="font-weight: 500; color: ${color};">${formatSessionName(sessionName)}</span>
                <div style="padding-left: 16px;">UMS: ${ums ?? 'N/A'}</div>
                ${grade ? `<div style="padding-left: 16px;">Grade: ${grade}</div>` : ''}
              </div>
            `;
          });
          
          return content;
        }
      }
    };

    return { chartData, gradeDistData, options };
  }, [umsData, selectedSessions, viewType]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="h-10 w-32 bg-surface-alt rounded-lg"></div>
          <div className="flex gap-2">
            <div className="h-10 w-40 bg-surface-alt rounded-lg"></div>
            <div className="h-10 w-40 bg-surface-alt rounded-lg"></div>
          </div>
        </div>
        <div className="h-96 bg-surface-alt rounded-lg"></div>
        <div className="flex flex-wrap gap-2">
          <div className="h-10 w-32 bg-surface-alt rounded-lg"></div>
          <div className="h-10 w-32 bg-surface-alt rounded-lg"></div>
          <div className="h-10 w-32 bg-surface-alt rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!subject || !unit) {
    return (
      <div className="text-center p-12 bg-surface rounded-lg border border-border">
        <h3 className="text-xl font-medium text-text mb-3">No Unit Selected</h3>
        <p className="text-text-muted max-w-md mx-auto">
          Please select a subject and unit from the dropdown menu to view UMS conversion charts.
        </p>
      </div>
    );
  }

  if (!umsData || !umsData.sessions.length) {
    return (
      <div className="text-center p-12 bg-surface rounded-lg border border-border">
        <h3 className="text-xl font-medium text-text mb-3">No Data Available</h3>
        <p className="text-text-muted max-w-md mx-auto">
          No UMS conversion data is currently available for this unit. Please try selecting a different unit.
        </p>
      </div>
    );
  }

  // Get sorted sessions for UI display
  const sortedSessions = sortSessions(umsData.sessions.map(s => s.session));

  return (
    <div className="space-y-6">
      {/* Header with Unit Info and View Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Unit Info */}
        <UnitSelector unit={unit} subject={subject} />
        
        {/* View Type Selector */}
        <div role="tablist" className="flex gap-2 p-1 bg-surface-alt/30 rounded-xl">
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
      <div className="h-96 bg-surface rounded-lg border border-border p-6 shadow-sm">
        {options ? (
          <ReactECharts
            option={options}
            style={{ height: '100%', width: '100%' }}
            className="transition-all duration-300"
            opts={{ renderer: 'svg' }}
            notMerge={true}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-text-muted">
            <div className="text-center">
              <p className="mb-2 text-lg">No chart data available</p>
              <p className="text-sm">Please select at least one session to display data</p>
            </div>
          </div>
        )}
      </div>

      {/* Session Selection */}
      <div className="p-4 bg-surface-alt/30 rounded-lg border border-border">
        <h3 className="text-lg font-medium mb-3">Exam Sessions</h3>
        <div className="flex flex-wrap gap-3">
          {sortedSessions.map((session, index) => {
            const sessionData = umsData.sessions.find(s => s.session === session);
            return (
              <SessionButton
                key={session}
                session={session}
                selected={selectedSessions.includes(session)}
                color={SESSION_COLORS[index % SESSION_COLORS.length]}
                metadata={sessionData?.metadata || { recordCount: 0, timestamp: "" }}
                onClick={() => {
                  setSelectedSessions((prev) =>
                    prev.includes(session)
                      ? prev.filter((s) => s !== session)
                      : [...prev, session]
                  );
                }}
              />
            );
          })}
        </div>
        
        <div className="flex gap-4 mt-4">
          <button 
            className="text-sm text-primary hover:text-primary-hover underline"
            onClick={() => setSelectedSessions(sortedSessions)}
          >
            Select all
          </button>
          <button 
            className="text-sm text-primary hover:text-primary-hover underline"
            onClick={() => setSelectedSessions([])}
          >
            Clear selection
          </button>
          <button 
            className="text-sm text-primary hover:text-primary-hover underline"
            onClick={() => setSelectedSessions(sortedSessions.slice(0, 3))}
          >
            Latest 3 sessions
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="text-sm text-text-muted grid sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-surface rounded-lg border border-border">
        <div>
          <span className="block text-text font-medium">Subject</span>
          <span>{subject?.name}</span>
        </div>
        <div>
          <span className="block text-text font-medium">Unit</span>
          <span>{unit?.name}</span>
        </div>
        <div>
          <span className="block text-text font-medium">Papers Found</span>
          <span>{umsData?.total_papers_found}</span>
        </div>
        <div>
          <span className="block text-text font-medium">Available Sessions</span>
          <span>{umsData?.sessions.length}</span>
        </div>
      </div>
    </div>
  );
}