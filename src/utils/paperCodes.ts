/**
 * Generates a paper code based on subject, unit, year and IAL status
 */
export function getPaperCode(
  paper: any,
  allPapers: any[]
): string | null {
  const { subject, unitId, year, session, title } = paper;
  
  // Return null for mathematics
  if (subject.startsWith('math')) {
    return null;
  }

  // Get subject prefix
  const subjectPrefix = 
    subject === 'chemistry' ? 'CH' :
    subject === 'physics' ? 'PH' :
    subject === 'biology' ? 'BI' : null;

  if (!subjectPrefix) {
    return null;
  }

  // Get unit number from unitId (e.g., "unit1" -> "1")
  const unitNumber = unitId.replace('unit', '');

  // Papers from 2019 onwards use new format
  if (year >= 2019) {
    console.log(`Paper from ${year}: Using format W${subjectPrefix}1${unitNumber}`);
    return `W${subjectPrefix}1${unitNumber}`;
  }

  // For papers before 2019
  // Check if title contains "IAL" - also handle cases where it's in the filename
  const isIAL = title?.toLowerCase().includes('ial') || 
                paper.pdfUrl?.toLowerCase().includes('(ial)') || 
                false;
  
  // Find papers in the same session (same unit, year, session)
  const sameCategoryPapers = allPapers.filter(p => 
    p.unitId === unitId &&
    p.year === year &&
    p.session === session
  );
  
  // Debug info
  console.log(`Paper: ${title}, Year: ${year}, Session: ${session}`);
  console.log(`Found ${sameCategoryPapers.length} papers in same category`);
  
  // Check if there's at least one IAL and one non-IAL paper in this session
  const hasIALPaper = sameCategoryPapers.some(p => 
    p.title?.toLowerCase().includes('ial') || 
    p.pdfUrl?.toLowerCase().includes('(ial)')
  );
  
  const hasNonIALPaper = sameCategoryPapers.some(p => 
    !(p.title?.toLowerCase().includes('ial') || 
    p.pdfUrl?.toLowerCase().includes('(ial)'))
  );
  
  // Debug to check IAL detection
  console.log(`Paper ${paper.id}: isIAL=${isIAL}, hasIALPaper=${hasIALPaper}, hasNonIALPaper=${hasNonIALPaper}`);
  
  // Both IAL and non-IAL papers exist in this session
  if (hasIALPaper && hasNonIALPaper) {
    console.log('Found both IAL and non-IAL papers');
    // Current paper has IAL
    if (isIAL) {
      console.log(`IAL paper: Using format W${subjectPrefix}0${unitNumber}`);
      return `W${subjectPrefix}0${unitNumber}`;
    } 
    // Current paper doesn't have IAL
    else {
      console.log(`Non-IAL paper: Using format 6${subjectPrefix}0${unitNumber}`);
      return `6${subjectPrefix}0${unitNumber}`;
    }
  } 
  // Only one type exists (all IAL or all non-IAL)
  else {
    console.log(`Only one type exists: Using format W${subjectPrefix}0${unitNumber}`);
    return `W${subjectPrefix}0${unitNumber}`;
  }
}

// Function to check if a paper is IAL
function isPaperIAL(paper: any): boolean {
  return paper.title?.toLowerCase().includes('ial') || 
         paper.pdfUrl?.toLowerCase().includes('(ial)') || 
         false;
}

// This function is now used to check for paper variants
export function hasPaperVariant(papers: any[], currentPaper: any): boolean {
  const currentIsIAL = isPaperIAL(currentPaper);
  
  return papers.some(paper => 
    paper.id !== currentPaper.id &&
    paper.unitId === currentPaper.unitId &&
    paper.year === currentPaper.year &&
    paper.session === currentPaper.session &&
    isPaperIAL(paper) !== currentIsIAL
  );
}