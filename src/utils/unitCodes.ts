/**
 * Extracts the unit code from a full unit name
 * e.g. "WPH15" from "WPH15-01_-_Unit_5-_Thermodynamics,_Radiation,_Oscillations_and_Cosmology"
 */
export function extractUnitCode(fullUnitName: string): string {
  // Match the pattern of letters followed by numbers at the start of the string
  const match = fullUnitName.match(/^[A-Z]+\d+/);
  return match ? match[0] : fullUnitName;
}