import { ConversionData } from "@/types/conversion";

export interface UnitInfo {
  id: string;
  name: string;
}

class ConversionAPI {
  private readonly apiBaseUrl = "https://papervoid-api-rgic.shuttle.app/api/marks";
  
  private async fetchJSON<T>(endpoint: string): Promise<T> {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getSubjects(): Promise<string[]> {
    // Get the latest session first, then get subjects for that session
    const sessions = await this.getSessions();
    if (sessions.length === 0) {
      return [];
    }
    
    // Default to the most recent session
    const latestSession = sessions[0];
    return this.getSubjectsForSession(latestSession);
  }

  async getSessions(): Promise<string[]> {
    try {
      const sessions: string[] = await this.fetchJSON(`${this.apiBaseUrl}/sessions`);
      
      // Transform session names from January_2025 to January 2025 format
      return sessions.map(session => session.replace('_', ' '));
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      return [];
    }
  }

  async getSubjectsForSession(session: string): Promise<string[]> {
    try {
      // Transform session from "January 2025" to "January_2025" format for API
      const formattedSession = session.replace(' ', '_');
      const subjects: string[] = await this.fetchJSON(
        `${this.apiBaseUrl}/sessions/${formattedSession}`
      );
      return subjects;
    } catch (error) {
      console.error(`Failed to fetch subjects for session ${session}:`, error);
      return [];
    }
  }

  async getUnitsForSubject(subjectId: string): Promise<UnitInfo[]> {
    try {
      // Get the latest session first
      const sessions = await this.getSessions();
      if (sessions.length === 0) {
        return [];
      }
      
      // Default to the most recent session
      const latestSession = sessions[0];
      return this.getUnitsForSubjectAndSession(subjectId, latestSession);
    } catch (error) {
      console.error(`Failed to fetch units for subject ${subjectId}:`, error);
      return [];
    }
  }

  async getUnitsForSubjectAndSession(subjectId: string, session: string): Promise<UnitInfo[]> {
    try {
      const formattedSession = session.replace(' ', '_');
      const unitPaths: string[] = await this.fetchJSON(
        `${this.apiBaseUrl}/sessions/${formattedSession}/${subjectId}`
      );
      
      // Transform unit paths to UnitInfo objects
      return unitPaths.map(unitPath => {
        // Extract unit code and name from format like "WPH11-01_-_Mechanics_and_Materials"
        const parts = unitPath.split('_-_');
        const id = parts[0];
        const name = parts[1]?.replace(/_/g, ' ') || unitPath;
        
        return { id, name };
      });
    } catch (error) {
      console.error(`Failed to fetch units for ${subjectId} in ${session}:`, error);
      return [];
    }
  }

  async getAvailableSessions(
    subjectId: string,
    unitId: string
  ): Promise<string[]> {
    try {
      // We need to check each session if it has the subject and unit
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
    } catch (error) {
      console.error(`Failed to fetch available sessions for ${subjectId}/${unitId}:`, error);
      return [];
    }
  }

  async getConversionData(
    subjectId: string,
    unitId: string,
    session: string
  ): Promise<ConversionData> {
    try {
      // Get all units for this subject and session first
      const units = await this.getUnitsForSubjectAndSession(subjectId, session);
      
      // Find the matching unit to get the full path
      const unit = units.find(u => u.id === unitId);
      if (!unit) {
        throw new Error(`Unit ${unitId} not found for ${subjectId} in ${session}`);
      }
      
      // Construct the unit path based on API format
      const unitPath = `${unitId}_-_${unit.name.replace(/ /g, '_')}`;
      
      // Fetch the conversion data
      const formattedSession = session.replace(' ', '_');
      const data: ConversionData = await this.fetchJSON(
        `${this.apiBaseUrl}/sessions/${formattedSession}/${subjectId}/${unitPath}`
      );
      
      return data;
    } catch (error) {
      console.error(`Failed to fetch conversion data for ${session}/${subjectId}/${unitId}:`, error);
      throw error;
    }
  }
}

export const conversionApi = new ConversionAPI();