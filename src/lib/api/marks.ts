import {
  MarksSessionsResponse,
  MarksSubjectsResponse,
  MarksUnitsResponse,
  MarksConversionResponse,
  UnitInfo,
} from "@/types/marks";
import { decryptResponse } from '@/lib/auth/request-security';
import { ConversionData } from "@/types/conversion";
import { createSignedRequest } from '@/lib/auth/request-security';

function getApiUrl() {
  const baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
  return `${baseUrl}/api/marks`;
}

async function fetchFromProxy<T>(path: string): Promise<T> {
  const API_URL = getApiUrl();
  
  // Create request security headers
  const { token, timestamp, signature } = await createSignedRequest();

  const response = await fetch(`${API_URL}?path=${encodeURIComponent(path)}`, {
    credentials: 'include', // Important: Send cookies for auth
    headers: {
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "X-Request-Token": token,
      "X-Request-Timestamp": timestamp.toString(),
      "X-Request-Signature": signature
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized. Please log in.");
    }
    if (response.status === 403) {
      throw new Error("Access forbidden. Invalid request signature.");
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "API request failed");
  }

  // Decrypt the response data if it's encrypted
  if (typeof result.data === 'string') {
    return await decryptResponse(result.data);
  }

  return result.data;
}

export const marksApi = {
  async getSessions(): Promise<string[]> {
    const data = await fetchFromProxy<string[]>("/sessions");
    return data.map(session => session.replace("_", " "));
  },

  async getSubjectsForSession(session: string): Promise<string[]> {
    const formattedSession = session.trim().replace(/\s+/g, "_");
    return fetchFromProxy<string[]>(`/sessions/${formattedSession}`);
  },

  async getUnitsForSubjectAndSession(
    subjectId: string,
    session: string
  ): Promise<UnitInfo[]> {
    const formattedSession = session.trim().replace(/\s+/g, "_");
    const paths = await fetchFromProxy<string[]>(
      `/sessions/${formattedSession}/${subjectId}`
    );

    // Transform unit paths to UnitInfo objects
    return paths.map(unitPath => {
      const parts = unitPath.split("_-_");
      const id = parts[0];
      const name = parts[1]?.replace(/_/g, " ") || unitPath;
      return { id, name };
    });
  },

  async getConversionData(
    subjectId: string,
    unitId: string,
    session: string
  ): Promise<ConversionData> {
    // Get all units for this subject and session first
    const units = await this.getUnitsForSubjectAndSession(subjectId, session);
    
    // Find the matching unit to get the full path
    const unit = units.find(u => u.id === unitId);
    if (!unit) {
      throw new Error(`Unit ${unitId} not found for ${subjectId} in ${session}`);
    }
    
    // Construct the unit path based on API format
    const unitPath = `${unitId}_-_${unit.name.replace(/ /g, "_")}`;
    const formattedSession = session.trim().replace(/\s+/g, "_");
    
    return fetchFromProxy<ConversionData>(
      `/sessions/${formattedSession}/${subjectId}/${unitPath}`
    );
  },

  async getSubjects(): Promise<string[]> {
    const sessions = await this.getSessions();
    if (sessions.length === 0) {
      return [];
    }
    
    // Default to the most recent session
    const latestSession = sessions[0];
    return this.getSubjectsForSession(latestSession);
  },

  async getUnitsForSubject(subjectId: string): Promise<UnitInfo[]> {
    const sessions = await this.getSessions();
    if (sessions.length === 0) {
      return [];
    }
    
    // Default to the most recent session
    const latestSession = sessions[0];
    return this.getUnitsForSubjectAndSession(subjectId, latestSession);
  },

  async getAvailableSessions(
    subjectId: string,
    unitId: string
  ): Promise<string[]> {
    const allSessions = await this.getSessions();
    const availableSessions: string[] = [];

    for (const session of allSessions) {
      try {
        const units = await this.getUnitsForSubjectAndSession(subjectId, session);
        const unitExists = units.some(unit => unit.id === unitId);
        
        if (unitExists) {
          availableSessions.push(session);
        }
      } catch {
        // If this session doesn't have the subject/unit, just skip it
        continue;
      }
    }

    return availableSessions;
  }
};