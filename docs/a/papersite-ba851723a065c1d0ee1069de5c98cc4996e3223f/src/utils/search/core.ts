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

function matchesSession(paperSession: string, querySession: string | undefined): boolean {
  if (!querySession) return true;
  
  const normalizedPaperSession = normalizeSearchTerm(paperSession);
  const normalizedQuerySession = normalizeSearchTerm(querySession);
  
  // Get all equivalent sessions for the query session
  const equivalentSessions = getEquivalentSessions(normalizedQuerySession);
  
  // Check if paper session matches any of the equivalent sessions
  return equivalentSessions.some(session => 
    normalizeSearchTerm(session) === normalizedPaperSession
  );
}

export function searchPapers(
  rawQuery: SearchQuery,
  data: SubjectsData
): { results: SearchResult[]; suggestions: SearchSuggestion[] } {
  const results: SearchResult[] = [];
  const suggestions: SearchSuggestion[] = [];

  // Parse the query text for smart matching
  const parsedQuery = parseSearchQuery(rawQuery.text);
  
  // Merge parsed query with explicit filters
  const query = {
    ...rawQuery,
    subject: rawQuery.subject || parsedQuery.subject,
    unit: rawQuery.unit || parsedQuery.unit,
    year: rawQuery.year || parsedQuery.year,
    session: rawQuery.session || parsedQuery.session,
    text: parsedQuery.text
  };

  // Search through all subjects
  Object.values(data.subjects).forEach(subject => {
    // Skip if subject filter doesn't match
    if (query.subject && normalizeSearchTerm(subject.name) !== normalizeSearchTerm(query.subject)) {
      return;
    }

    subject.papers.forEach(paper => {
      const unit = subject.units.find(u => u.id === paper.unitId);
      if (!unit) return;

      // Skip if unit filter doesn't match
      if (query.unit && normalizeSearchTerm(unit.name) !== normalizeSearchTerm(query.unit)) {
        return;
      }

      // Skip if year filter doesn't match
      if (query.year && paper.year !== query.year) {
        return;
      }

      // Skip if session filter doesn't match (now using matchesSession)
      if (query.session && !matchesSession(paper.session, query.session)) {
        return;
      }

      const matches: SearchResult['matches'] = {
        text: matchesText(query.text, paper, unit, subject),
        subject: !query.subject || normalizeSearchTerm(subject.name) === normalizeSearchTerm(query.subject),
        unit: !query.unit || normalizeSearchTerm(unit.name) === normalizeSearchTerm(query.unit),
        year: !query.year || paper.year === query.year,
        session: !query.session || matchesSession(paper.session, query.session)
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
      
      if (query.subject && !query.unit && subject.name.toLowerCase().includes(query.subject.toLowerCase())) {
        subject.units.forEach(unit => {
          suggestions.push({
            type: 'unit',
            text: `Look in "${unit.name}" unit`,
            value: unit.name,
            score: 0.7
          });
        });
      }

      if (!query.year) {
        suggestions.push({
          type: 'refinement',
          text: 'Add a year to your search (e.g., 2024)',
          value: '',
          score: 0.6
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

  return { 
    results: results.slice(0, 20), // Limit to top 20 results
    suggestions: uniqueSuggestions.slice(0, 5) // Limit to top 5 suggestions
  };
}