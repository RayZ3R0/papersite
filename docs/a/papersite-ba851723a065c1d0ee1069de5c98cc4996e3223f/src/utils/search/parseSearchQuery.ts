export interface ParsedSearch {
  subject: string | null;
  unit: number | null;
  session: string | null;
  year: number | null;
}

// Subject code mappings
const subjectCodes: Record<string, string> = {
  'phy': 'physics',
  'chem': 'chemistry',
  'bio': 'biology',
  'math': 'mathematics',
  'econ': 'economics',
  'psych': 'psychology',
  'bus': 'business',
  'acc': 'accounting'
};

// Pattern matching helpers
const patterns = {
  subject: new RegExp(`^(${Object.keys(subjectCodes).join('|')})`, 'i'),
  unit: /u[1-6]/i,
  session: /(jan|june?|oct)/i,
  year: /(?:20)?(\d{2})/
};

// Normalize session names
const normalizeSession = (session: string): string => {
  const map: Record<string, string> = {
    'jan': 'January',
    'june': 'June',
    'jun': 'June',
    'oct': 'October'
  };
  return map[session.toLowerCase()] || session;
};

// Normalize year (23 -> 2023)
const normalizeYear = (year: string): number => {
  const num = parseInt(year);
  return num < 100 ? 2000 + num : num;
};

export function parseSearchQuery(query: string): ParsedSearch {
  // Initialize result
  const result: ParsedSearch = {
    subject: null,
    unit: null,
    session: null,
    year: null
  };

  if (!query.trim()) {
    return result;
  }

  // Clean and split query
  const terms = query.trim().toLowerCase().split(/\s+/);

  // Try to match subject first
  const subjectMatch = terms[0]?.match(patterns.subject);
  if (subjectMatch) {
    const code = subjectMatch[0].toLowerCase();
    result.subject = subjectCodes[code];
    terms.shift(); // Remove matched subject
  }

  // Look for patterns in remaining terms
  terms.forEach(term => {
    // Match unit number
    const unitMatch = term.match(patterns.unit);
    if (unitMatch && !result.unit) {
      const unitNum = parseInt(unitMatch[0].replace(/\D/g, ''));
      if (unitNum >= 1 && unitNum <= 6) {
        result.unit = unitNum;
      }
      return;
    }

    // Match session
    const sessionMatch = term.match(patterns.session);
    if (sessionMatch && !result.session) {
      result.session = normalizeSession(sessionMatch[0]);
      return;
    }

    // Match year
    const yearMatch = term.match(patterns.year);
    if (yearMatch && !result.year) {
      result.year = normalizeYear(yearMatch[1]);
      return;
    }
  });

  // Handle combined formats (e.g., "p1jan21", "phy1jan23")
  if (terms.length === 1) {
    const combined = terms[0];
    
    // Try to extract unit
    const unitMatch = combined.match(/[u]?[1-6]/i);
    if (unitMatch && !result.unit) {
      const unitNum = parseInt(unitMatch[0].replace(/\D/g, ''));
      if (unitNum >= 1 && unitNum <= 6) {
        result.unit = unitNum;
      }
    }

    // Try to extract session
    const sessionMatch = combined.match(/(jan|june?|oct)/i);
    if (sessionMatch && !result.session) {
      result.session = normalizeSession(sessionMatch[0]);
    }

    // Try to extract year
    const yearMatch = combined.match(/\d{2,4}/);
    if (yearMatch && !result.year) {
      result.year = normalizeYear(yearMatch[0]);
    }
  }

  return result;
}

export function paperMatchesSearch(
  paper: { unitId: string; session: string; year: number },
  subject: { id: string; units: { id: string }[] },
  search: ParsedSearch
): boolean {
  // Check subject
  if (search.subject && subject.id !== search.subject) {
    return false;
  }

  // Check unit
  if (search.unit) {
    const unitMatches = subject.units.some(
      u => u.id === `unit${search.unit}` && u.id === paper.unitId
    );
    if (!unitMatches) return false;
  }

  // Check session
  if (search.session && paper.session !== search.session) {
    return false;
  }

  // Check year
  if (search.year && paper.year !== search.year) {
    return false;
  }

  return true;
}

export function formatSearchQuery(parsed: ParsedSearch): string {
  const parts: string[] = [];

  if (parsed.subject) {
    parts.push(parsed.subject);
  }

  if (parsed.unit) {
    parts.push(`Unit ${parsed.unit}`);
  }

  if (parsed.session) {
    parts.push(parsed.session);
  }

  if (parsed.year) {
    parts.push(parsed.year.toString());
  }

  return parts.join(' • ');
}
