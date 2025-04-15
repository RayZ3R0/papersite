/**
 * Generates a paper code based on subject, unit, year and IAL status
 */
export function getPaperCode(
  paper: any,
  allPapers: any[]
): string | null {
  const { subject, unitId, year, session, title } = paper;
  
  // Return null for mathematics
  if (subject && subject.startsWith('math')) {
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
  
  // Check if there's at least one IAL and one non-IAL paper in this session
  const hasIALPaper = sameCategoryPapers.some(p => 
    p.title?.toLowerCase().includes('ial') || 
    p.pdfUrl?.toLowerCase().includes('(ial)')
  );
  
  const hasNonIALPaper = sameCategoryPapers.some(p => 
    !(p.title?.toLowerCase().includes('ial') || 
    p.pdfUrl?.toLowerCase().includes('(ial)'))
  );
  
  // Construct the paper code
  let paperCode = `${subjectPrefix}${unitNumber}`;
  
  // Add IAL suffix if needed
  if (hasIALPaper && hasNonIALPaper) {
    paperCode += isIAL ? ' (IAL)' : ' (GCE)';
  }
  
  return paperCode;
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