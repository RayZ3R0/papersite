/**
 * Generates a paper code based on subject, unit, year and IAL status
 * Format:
 * - 2019 onwards: WCH11, WPH11, WBI11 etc (unit number increments)
 * - Before 2019 with IAL variant:
 *   IAL papers: WCH01, WPH01, WBI01 etc.
 *   Regular papers: 6CH01, 6PH01, 6BI01 etc.
 */
export function getPaperCode(params: {
  subject: string;
  unitId: string;
  year: number;
  title: string;
}): string | null {
  // Return null for mathematics
  if (params.subject.startsWith('math')) {
    return null;
  }

  // Get subject prefix
  const subjectPrefix = 
    params.subject === 'chemistry' ? 'CH' :
    params.subject === 'physics' ? 'PH' :
    params.subject === 'biology' ? 'BI' : null;

  if (!subjectPrefix) {
    return null;
  }

  // Get unit number from unitId (e.g., "unit1" -> "1")
  const unitNumber = params.unitId.replace('unit', '');

  // Papers from 2019 onwards use new format
  if (params.year >= 2019) {
    return `W${subjectPrefix}1${unitNumber}`;
  }

  // For papers before 2019, check if it has IAL variant by looking for "IAL" in title
  const isIAL = params.title.includes('IAL');
  // If it has IAL in the title, it uses W prefix, otherwise 6 prefix
  return isIAL ? `W${subjectPrefix}0${unitNumber}` : `6${subjectPrefix}0${unitNumber}`;
}