import { ConversionData } from "./conversion";

export interface UnitInfo {
  id: string;
  name: string;
}

export interface MarksAPIResponse {
  success: boolean;
  data: unknown;
  error?: string;
}

export interface MarksSessionsResponse extends MarksAPIResponse {
  data: string[];
}

export interface MarksSubjectsResponse extends MarksAPIResponse {
  data: string[];
}

export interface MarksUnitsResponse extends MarksAPIResponse {
  data: UnitInfo[];
}

export interface MarksConversionResponse extends MarksAPIResponse {
  data: ConversionData;
}