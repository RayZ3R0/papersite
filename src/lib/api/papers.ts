export interface Paper {
  id: string;
  unit_id: string;
  unit_code: string;
  year: number;
  session: string;
  pdf_url: string;
  marking_scheme_url: string;
  title: string;
  subject_name?: string;
}

export interface Unit {
  id: string;
  name: string;
  order: number;
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
  units: Unit[];
}

export interface SubjectWithStats extends Subject {
  total_papers: number;
}

export interface UnitSummary {
  id: string;
  name: string;
  description?: string;
  total_papers: number;
  years_with_sessions: Array<{
    year: number;
    sessions: string[];
  }>;
  available_sessions: string[];
  unit_codes: string[];
}

// Get the base URL dynamically based on the current environment
function getApiUrl() {
  if (typeof window !== "undefined") {
    // Client-side: use the current origin
    return `${window.location.origin}/api/papers`;
  } else {
    // Server-side: fallback to environment variable or default
    return (
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/papers"
    );
  }
}

async function fetchFromProxy(path: string) {
  const API_URL = getApiUrl();

  const response = await fetch(`${API_URL}?path=${encodeURIComponent(path)}`, {
    // Add cache headers for better performance
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
}

export const papersApi = {
  async getSubjects(): Promise<SubjectWithStats[]> {
    return fetchFromProxy("/subjects");
  },

  async getSubjectUnits(subjectId: string): Promise<Unit[]> {
    return fetchFromProxy(`/subjects/${subjectId}/units`);
  },

  async getUnitPapers(subjectId: string, unitId: string): Promise<Paper[]> {
    return fetchFromProxy(`/subjects/${subjectId}/units/${unitId}/papers`);
  },

  async getUnitSummary(
    subjectId: string,
    unitId: string,
  ): Promise<UnitSummary> {
    return fetchFromProxy(`/subjects/${subjectId}/units/${unitId}/summary`);
  },

  async searchPapers(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<Paper[]> {
    return fetchFromProxy(
      `/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    );
  },
};
