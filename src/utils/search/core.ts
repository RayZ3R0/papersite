import { SearchQuery, SearchResult, SearchSuggestion } from '@/types/search';
import { Subject, Paper, Unit } from '@/types/subject';
import { SubjectsData } from '@/types/subject';
import { parseSearchQuery, normalizeSearchTerm, getEquivalentSessions } from './queryParser';

function calculateScore(matches: SearchResult['matches'], year: number): number {
  const weights = {
    text: 0.3,
    subject: 0.2,
    unit: 0.2,
    year: 0.15,
    session: 0.1,
    type: 0.05
  };

  let score = 0;
  let totalWeight = 0;

  Object.entries(matches).forEach(([key, matched]) => {
    if (matched) {
      score += weights[key as keyof typeof weights];
    }
    totalWeight += weights[key as keyof typeof weights];
  });

  // Boost score for more recent papers
  const currentYear = new Date().getFullYear();
  const yearBoost = Math.max(0, 1 - (currentYear - year) * 0.1); // 10% penalty per year old
  
  return (score / totalWeight) * (1 + yearBoost);
}

function matchesText(searchTerm: string, paper: Paper, unit: Unit, subject: Subject): boolean {
  const normalizedSearch = normalizeSearchTerm(searchTerm);
  if (!normalizedSearch) return true; // Empty search matches everything
  
  const searchFields = [
    paper.title,
    unit.name,
    subject.name,
    paper.session,
    paper.year.toString()
  ].map(field => field ? normalizeSearchTerm(field) : '');
  
  if (unit.description) {
    searchFields.push(normalizeSearchTerm(unit.description));
  }

  return searchFields.some(field => field.includes(normalizedSearch));
}

// Enhanced session matching to handle multiple sessions
function matchesSession(paperSession: string, querySessions: string[] | string | undefined): boolean {
  if (!querySessions) return true;
  
  // Convert to array if it's a single string
  const sessionsToCheck = Array.isArray(querySessions) ? querySessions : [querySessions];
  
  // If there are no sessions to check, return true (match everything)
  if (sessionsToCheck.length === 0) return true;
  
  const normalizedPaperSession = normalizeSearchTerm(paperSession);
  
  // Check if the paper session matches any of the query sessions or their equivalents
  return sessionsToCheck.some(querySession => {
    const normalizedQuerySession = normalizeSearchTerm(querySession);
    const equivalentSessions = getEquivalentSessions(normalizedQuerySession);
    
    return equivalentSessions.some(session => 
      normalizeSearchTerm(session) === normalizedPaperSession || 
      normalizedPaperSession.includes(normalizeSearchTerm(session))
    );
  });
}

// Handle unit matching to support multiple units
function matchesUnit(paperUnitId: string, unit: Unit, queryUnits: string[] | string | undefined): boolean {
  if (!queryUnits) return true;
  
  // Convert to array if it's a single string
  const unitsToCheck = Array.isArray(queryUnits) ? queryUnits : [queryUnits];
  
  // If there are no units to check, return true (match everything)
  if (unitsToCheck.length === 0) return true;
  
  // Check if the unit name matches any of the query units
  return unitsToCheck.some(queryUnit => 
    normalizeSearchTerm(unit.name) === normalizeSearchTerm(queryUnit)
  );
}

// Helper function to check if a paper is a duplicate
function isDuplicate(paper: Paper, seenPapers: Map<string, string[]>): boolean {
  // Create a unique key based on identifiable paper attributes
  const paperKey = `${paper.session}-${paper.year}-${paper.title}`;
  
  // If we haven't seen this paper before, record it with its unit ID
  if (!seenPapers.has(paperKey)) {
    seenPapers.set(paperKey, [paper.unitId]);
    return false;
  }
  
  // Get list of units this paper is already assigned to
  const assignedUnits = seenPapers.get(paperKey) || [];
  
  // If this paper is already assigned to this unit, it's a duplicate
  if (assignedUnits.includes(paper.unitId)) {
    return true;
  }
  
  // Otherwise, add this unit to the list for this paper
  assignedUnits.push(paper.unitId);
  seenPapers.set(paperKey, assignedUnits);
  return false;
}

export function searchPapers(
  rawQuery: SearchQuery,
  data: SubjectsData,
  sessionVariants?: string[]
): { results: SearchResult[]; suggestions: SearchSuggestion[] } {
  const results: SearchResult[] = [];
  const suggestions: SearchSuggestion[] = [];
  
  // Map to track duplicate papers using pdfUrl as a unique identifier
  const seenPaperUrls = new Set<string>();
  
  // Map to track papers by properties for more complex duplicate detection
  const seenPapers = new Map<string, string[]>();

  // Parse the query text for smart matching
  const parsedQuery = parseSearchQuery(rawQuery.text);
  
  // Create type-safe merged query with defaults for arrays
  const query = {
    ...rawQuery,
    subject: rawQuery.subject || parsedQuery.subject,
    unit: rawQuery.unit || parsedQuery.unit,
    unitArray: rawQuery.unitArray || [],
    year: rawQuery.year || parsedQuery.year,
    session: rawQuery.session || parsedQuery.session,
    sessionArray: rawQuery.sessionArray || (sessionVariants ? sessionVariants : []),
    text: parsedQuery.text
  };

  // Handle multiple sessions provided externally
  const sessionsToMatch = sessionVariants || 
                          (query.sessionArray?.length ? query.sessionArray : (query.session ? [query.session] : []));

  // Search through all subjects
  Object.values(data.subjects).forEach(subject => {
    // Skip if subject filter doesn't match
    if (query.subject && normalizeSearchTerm(subject.name) !== normalizeSearchTerm(query.subject)) {
      return;
    }

    subject.papers.forEach(paper => {
      // Skip duplicate papers based on pdfUrl (most reliable unique identifier)
      if (seenPaperUrls.has(paper.pdfUrl)) {
        return;
      }
      
      // Skip if detected as a complex duplicate
      if (isDuplicate(paper, seenPapers)) {
        return;
      }
      
      // Add this paper's URL to the set of seen URLs
      seenPaperUrls.add(paper.pdfUrl);

      const unit = subject.units.find(u => u.id === paper.unitId);
      if (!unit) return;

      // Skip if unit filter doesn't match - now handles multiple units
      const unitQuery = query.unitArray?.length ? query.unitArray : (query.unit ? [query.unit] : []);
      if (unitQuery.length > 0 && !matchesUnit(paper.unitId, unit, unitQuery)) {
        return;
      }

      // Skip if year filter doesn't match
      if (query.year && paper.year !== query.year) {
        return;
      }

      // Skip if session filter doesn't match - now handles multiple sessions
      if (sessionsToMatch.length > 0 && !matchesSession(paper.session, sessionsToMatch)) {
        return;
      }

      const matches: SearchResult['matches'] = {
        text: matchesText(query.text, paper, unit, subject),
        subject: !query.subject || normalizeSearchTerm(subject.name) === normalizeSearchTerm(query.subject),
        unit: unitQuery.length === 0 || matchesUnit(paper.unitId, unit, unitQuery),
        year: !query.year || paper.year === query.year,
        session: sessionsToMatch.length === 0 || matchesSession(paper.session, sessionsToMatch)
      };

      // Only include results that match the criteria
      if (Object.values(matches).some(match => match)) {
        results.push({
          paper,
          unit,
          subject,
          score: calculateScore(matches, paper.year),
          matches
        });
      }
    });

    // Generate smart suggestions
    if (results.length === 0) {
      if (!query.subject) {
        suggestions.push({
          type: 'subject',
          text: `Try searching in "${subject.name}"`,
          value: subject.name,
          score: 0.8
        });
      }
      
      if (query.subject && (!query.unit || !query.unitArray?.length) && 
          subject.name.toLowerCase().includes(query.subject.toLowerCase())) {
        subject.units.forEach(unit => {
          suggestions.push({
            type: 'unit',
            text: `Look in "${unit.name}" unit`,
            value: unit.name,
            score: 0.7
          });
        });
      }

      // Session suggestions
      if (!query.session && !query.sessionArray?.length) {
        // Find most common sessions for this subject
        const sessionCounts = new Map<string, number>();
        subject.papers.forEach(paper => {
          const sessionKey = `${paper.session} ${paper.year}`;
          sessionCounts.set(sessionKey, (sessionCounts.get(sessionKey) || 0) + 1);
        });
        
        // Convert to array, sort by count, and take top 2
        const topSessions = Array.from(sessionCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2);
          
        topSessions.forEach(([session]) => {
          suggestions.push({
            type: 'session',
            text: `Try papers from "${session}"`,
            value: session,
            score: 0.65
          });
        });
      }

      if (!query.year) {
        // Suggest papers from the most recent 2 years
        const years = Array.from(new Set(subject.papers.map(p => p.year)))
          .sort((a, b) => b - a)
          .slice(0, 2);
          
        years.forEach(year => {
          suggestions.push({
            type: 'year',
            text: `Papers from ${year}`,
            value: year.toString(),
            score: 0.6
          });
        });
      }
    }
  });

  // Sort results by score
  results.sort((a, b) => b.score - a.score);

  // Sort suggestions by score and remove duplicates
  const uniqueSuggestions = suggestions
    .sort((a, b) => b.score - a.score)
    .filter((s, i, arr) => arr.findIndex(x => x.text === s.text) === i);
    
  // Add special suggestions for multiple filter selections
  if ((query.unitArray?.length ?? 0) > 1 || sessionsToMatch.length > 1) {
    uniqueSuggestions.unshift({
      type: 'info',
      text: `Searching across ${query.unitArray?.length || 0} units and ${sessionsToMatch.length || 0} sessions`,
      value: '',
      score: 1.0
    });
  }

  return { 
    results: results.slice(0, 20), // Limit to top 20 results
    suggestions: uniqueSuggestions.slice(0, 5) // Limit to top 5 suggestions
  };
}

// Helper function to combine results from multiple sessions for better ranking
export function combineMultiSessionResults(results: SearchResult[]): SearchResult[] {
  // Group by paper ID to identify duplicates across sessions
  const groupedByPaper = new Map<string, SearchResult[]>();
  
  results.forEach(result => {
    const key = `${result.subject.id}-${result.unit.id}-${result.paper.year}`;
    if (!groupedByPaper.has(key)) {
      groupedByPaper.set(key, []);
    }
    groupedByPaper.get(key)?.push(result);
  });
  
  // For each group, take the result with highest score
  const combinedResults: SearchResult[] = [];
  groupedByPaper.forEach(resultGroup => {
    // Sort by score (highest first)
    resultGroup.sort((a, b) => b.score - a.score);
    
    // If there are multiple results, boost the score slightly to reward papers
    // that appear across multiple selected sessions
    if (resultGroup.length > 1) {
      const topResult = resultGroup[0];
      // Boost score by 5% for each additional match, up to 20%
      const boostFactor = Math.min(1.2, 1 + (resultGroup.length - 1) * 0.05);
      topResult.score *= boostFactor;
    }
    
    // Add the top result
    combinedResults.push(resultGroup[0]);
  });
  
  // Sort the combined results by score
  return combinedResults.sort((a, b) => b.score - a.score);
}

// Export helper functions for testing
export {
  matchesText,
  matchesSession,
  matchesUnit,
  calculateScore,
  isDuplicate
};