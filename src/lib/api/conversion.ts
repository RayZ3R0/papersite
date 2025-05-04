import { ConversionData, ConversionRecord } from "@/types/conversion";
import { marksApi } from "./marks";
import { UnitInfo } from "@/types/marks";

export type { UnitInfo };

function processDuplicates(data: ConversionData): ConversionData {
  // Group entries by RAW/UMS pair
  const groups = new Map<string, ConversionRecord[]>();
  
  data.data.forEach(entry => {
    const key = `${entry.RAW}-${entry.UMS}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(entry);
  });

  // Process each group to handle duplicates
  const processedData: ConversionRecord[] = [];
  groups.forEach(entries => {
    if (entries.length === 1) {
      // No duplicates, just keep the entry
      processedData.push(entries[0]);
    } else {
      // Check for Max Mark entry
      const maxMarkEntry = entries.find(e => e.GRADE === "Max Mark");
      if (maxMarkEntry) {
        processedData.push(maxMarkEntry);
      } else {
        // No Max Mark entry, just keep the first one
        processedData.push(entries[0]);
      }
    }
  });

  // Sort by RAW score descending
  processedData.sort((a, b) => b.RAW - a.RAW);

  return {
    ...data,
    metadata: {
      ...data.metadata,
      recordCount: processedData.length
    },
    data: processedData
  };
}

class ConversionAPI {
  async getSessions(): Promise<string[]> {
    try {
      return await marksApi.getSessions();
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      return [];
    }
  }

  async getSubjectsForSession(session: string): Promise<string[]> {
    try {
      return await marksApi.getSubjectsForSession(session);
    } catch (error) {
      console.error(`Failed to fetch subjects for session ${session}:`, error);
      return [];
    }
  }

  async getSubjects(): Promise<string[]> {
    try {
      return await marksApi.getSubjects();
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      return [];
    }
  }

  async getUnitsForSubject(subjectId: string): Promise<UnitInfo[]> {
    try {
      return await marksApi.getUnitsForSubject(subjectId);
    } catch (error) {
      console.error(`Failed to fetch units for subject ${subjectId}:`, error);
      return [];
    }
  }

  async getUnitsForSubjectAndSession(
    subjectId: string, 
    session: string
  ): Promise<UnitInfo[]> {
    try {
      return await marksApi.getUnitsForSubjectAndSession(subjectId, session);
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
      return await marksApi.getAvailableSessions(subjectId, unitId);
    } catch (error) {
      console.error(`Failed to fetch available sessions for ${subjectId}/${unitId}:`, error);
      return [];
    }
  }

  async getConversionData(
    subjectId: string,
    apiPath: string,
    session: string
  ): Promise<ConversionData> {
    try {
      // Extract unitId from the API path (format: "WAC11-01_-_The_Accounting_System_and_Costing")
      const unitId = apiPath.split("_-_")[0];
      const data = await marksApi.getConversionData(subjectId, unitId, session);
      return processDuplicates(data);
    } catch (error) {
      console.error(`Failed to fetch conversion data for ${session}/${subjectId}/${apiPath}:`, error);
      throw error;
    }
  }
}

export const conversionApi = new ConversionAPI();