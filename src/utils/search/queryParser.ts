interface ParsedQuery {
  subject?: string;
  unit?: string;
  year?: number;
  session?: string;
  text: string;
}

// Session mappings for equivalent sessions
const SESSION_MAPPINGS: Record<string, string[]> = {
  'may': ['may', 'june'],
  'june': ['may', 'june'],
  'january': ['january'],
  'october': ['october']
};

const SUBJECT_ALIASES: Record<string, string> = {
  'phy': 'physics',
  'phys': 'physics',
  'p': 'physics',
  'ph': 'physics',
  'physi': 'physics',
  'physic': 'physics',
  'ch': 'chemistry',
  'che': 'chemistry',
  'chem': 'chemistry',
  'chemi': 'chemistry',
  'chemis': 'chemistry',
  'chemist': 'chemistry',
  'chemistr': 'chemistry',
  'bi': 'biology',
  'bio': 'biology',
  'biol': 'biology',
  'biolo': 'biology',
  'biolog': 'biology',
  'm': 'mathematics',
  'ma': 'mathematics',
  'mat': 'mathematics',
  'math': 'mathematics',
  'maths': 'mathematics',
  'meth': 'mathematics',
  'ac': 'accounting',
  'acc': 'accounting',
  'account': 'accounting',
  'accounti': 'accounting',
  'accountin': 'accounting',
  'ec': 'economics',
  'eco': 'economics',
  'econom': 'economics',
  'economi': 'economics',
  'economis': 'economics',
  'economic': 'economics',
  'bu': 'business',
  'bus': 'business',
  'busi': 'business',
  'busine': 'business',
  'busines': 'business',
  'business': 'business',
  'businesse': 'business',
  'ps': 'psychology',
  'psy': 'psychology',
  'psyc': 'psychology',
  'psych': 'psychology',
  'psychol': 'psychology',
  'psycholo': 'psychology',
  'psycholog': 'psychology',
};

const UNIT_ALIASES: Record<string, Record<string, string>> = {
  'physics': {
    'u1': 'Unit 1',
    'unit1': 'Unit 1',
    'p1': 'Unit 1',
    'mech': 'Unit 1',
    'mechanics': 'Unit 1',
    'u2': 'Unit 2',
    'p2': 'Unit 2',
    'unit2': 'Unit 2',
    'wave': 'Unit 2',
    'waves': 'Unit 2',
    'u3': 'Unit 3',
    'unit3': 'Unit 3',
    'fields': 'Unit 3',
    'field': 'Unit 3',
    'u4': 'Unit 4',
    'unit4': 'Unit 4',
    'particles': 'Unit 4',
    'particle': 'Unit 4',
    'u5': 'Unit 5',
    'unit5': 'Unit 5',
    'astro': 'Unit 5',
    'astronomy': 'Unit 5',
    'u6': 'Unit 6',
    'unit6': 'Unit 6',
    'nuclear': 'Unit 6',
  },
  'mathematics': {
    'p1': 'Pure 1',
    'pure1': 'Pure 1',
    'm1': 'Mechanics 1',
    'mech1': 'Mechanics 1',
    's1': 'Statistics 1',
    'stat1': 'Statistics 1',
    'd1': 'Decision 1',
    'dec1': 'Decision 1',
    'p2': 'Pure 2',
    'pure2': 'Pure 2',
    'm2': 'Mechanics 2',
    'mech2': 'Mechanics 2',
    's2': 'Statistics 2',
    'stat2': 'Statistics 2',
    'd2': 'Decision 2',
    'dec2': 'Decision 2',
    'p3': 'Pure 3',
    'pure3': 'Pure 3',
    'm3': 'Mechanics 3',
    'mech3': 'Mechanics 3',
    's3': 'Statistics 3',
    'stat3': 'Statistics 3',
    'd3': 'Decision 3',
    'dec3': 'Decision 3',
    'p4': 'Pure 4',
    'pure4': 'Pure 4',
    'fp1': 'Further Pure 1',
    'furtherpure1': 'Further Pure 1',
    'fp2': 'Further Pure 2',
    'furtherpure2': 'Further Pure 2',
    'fp3': 'Further Pure 3',
    'furtherpure3': 'Further Pure 3',
  },
  'chemistry': {
    'u1': 'Unit 1',
    'unit1': 'Unit 1',
    'u2': 'Unit 2',
    'unit2': 'Unit 2',
    'u3': 'Unit 3',
    'unit3': 'Unit 3',
    'u4': 'Unit 4',
    'unit4': 'Unit 4',
    'u5': 'Unit 5',
    'unit5': 'Unit 5',
    'u6': 'Unit 6',
    'unit6': 'Unit 6',
  },
  'biology': {
    'u1': 'Unit 1',
    'unit1': 'Unit 1',
    'u2': 'Unit 2',
    'unit2': 'Unit 2',
    'u3': 'Unit 3',
    'unit3': 'Unit 3',
    'u4': 'Unit 4',
    'unit4': 'Unit 4',
    'u5': 'Unit 5',
    'unit5': 'Unit 5',
    'u6': 'Unit 6',
    'unit6': 'Unit 6',
  },
  'accounting': {
    'u1': 'Unit 1',
    'unit1': 'Unit 1',
    'u2': 'Unit 2',
    'unit2': 'Unit 2',
    'u3': 'Unit 3',
    'unit3': 'Unit 3',
    'u4': 'Unit 4',
    'unit4': 'Unit 4',
  },
  'economics': {
    'u1': 'Unit 1',
    'unit1': 'Unit 1',
    'u2': 'Unit 2',
    'unit2': 'Unit 2',
    'u3': 'Unit 3',
    'unit3': 'Unit 3',
    'u4': 'Unit 4',
    'unit4': 'Unit 4',
    'u5': 'Unit 5',
    'unit5': 'Unit 5',
    'u6': 'Unit 6',
    'unit6': 'Unit 6',
  },
  'business': {
    'u1': 'Unit 1',
    'unit1': 'Unit 1',
    'u2': 'Unit 2',
    'unit2': 'Unit 2',
    'u3': 'Unit 3',
    'unit3': 'Unit 3',
    'u4': 'Unit 4',
    'unit4': 'Unit 4',
    'u5': 'Unit 5',
    'unit5': 'Unit 5',
    'u6': 'Unit 6',
    'unit6': 'Unit 6',
  },
  'psychology': {
    'u1': 'Unit 1',
    'unit1': 'Unit 1',
    'u2': 'Unit 2',
    'unit2': 'Unit 2',
    'u3': 'Unit 3',
    'unit3': 'Unit 3',
    'u4': 'Unit 4',
    'unit4': 'Unit 4',
    'u5': 'Unit 5',
    'unit5': 'Unit 5',
    'u6': 'Unit 6',
    'unit6': 'Unit 6',
  },
};

const MONTH_ALIASES: Record<string, string> = {
  'jan': 'january',
  'feb': 'february',
  'mar': 'march',
  'apr': 'april',
  'may': 'may',
  'jun': 'june',
  'jul': 'july',
  'aug': 'august',
  'sep': 'september',
  'sept': 'september',
  'oct': 'october',
  'nov': 'november',
  'dec': 'december'
};

function getYearFromString(str: string): number | null {
  const num = parseInt(str);
  if (isNaN(num)) return null;
  
  // Handle 2-digit years (21 -> 2021)
  if (str.length === 2) {
    return 2000 + num;
  }
  // Handle 4-digit years (2021)
  if (str.length === 4 && num >= 2000 && num <= 2025) {
    return num;
  }
  return null;
}

// Helper function to get all equivalent sessions
export function getEquivalentSessions(session: string): string[] {
  const normalizedSession = session.toLowerCase();
  // Check if this session has mappings
  return SESSION_MAPPINGS[normalizedSession] || [normalizedSession];
}

export function parseSearchQuery(query: string): ParsedQuery {
  let words = query.toLowerCase().trim().split(/\s+/);
  const result: ParsedQuery = { text: query };
  
  // Extract year
  const yearIndex = words.findIndex(word => getYearFromString(word) !== null);
  if (yearIndex !== -1) {
    const year = getYearFromString(words[yearIndex]);
    if (year) {
      result.year = year;
      words = [...words.slice(0, yearIndex), ...words.slice(yearIndex + 1)];
    }
  }

  // Extract subject
  const subjectIndex = words.findIndex(word => 
    SUBJECT_ALIASES[word] || Object.values(SUBJECT_ALIASES).includes(word)
  );

  if (subjectIndex !== -1) {
    result.subject = SUBJECT_ALIASES[words[subjectIndex]] || words[subjectIndex];
    words = [...words.slice(0, subjectIndex), ...words.slice(subjectIndex + 1)];
  }

  // Extract unit if subject is known
  if (result.subject && UNIT_ALIASES[result.subject]) {
    const unitAliases = UNIT_ALIASES[result.subject];
    const unitIndex = words.findIndex(word => 
      unitAliases[word] || Object.values(unitAliases).includes(word)
    );

    if (unitIndex !== -1) {
      result.unit = unitAliases[words[unitIndex]] || words[unitIndex];
      words = [...words.slice(0, unitIndex), ...words.slice(unitIndex + 1)];
    }
  }

  // Extract month/session
  const monthIndex = words.findIndex(word => 
    MONTH_ALIASES[word] || Object.values(MONTH_ALIASES).includes(word)
  );

  if (monthIndex !== -1) {
    const session = MONTH_ALIASES[words[monthIndex]] || words[monthIndex];
    result.session = session;  // Store the actual session mentioned
    words = [...words.slice(0, monthIndex), ...words.slice(monthIndex + 1)];
  }

  // Smart unit extraction for remaining text
  if (!result.unit && result.subject) {
    const unitAliases = UNIT_ALIASES[result.subject];
    if (unitAliases) {
      const remainingText = words.join(' ');
      for (const [alias, unit] of Object.entries(unitAliases)) {
        if (remainingText.includes(alias)) {
          result.unit = unit;
          words = words.filter(w => !w.includes(alias));
          break;
        }
      }
    }
  }

  // Handle combined formats (e.g., "p1jan21")
  if (words.length === 1) {
    const combined = words[0];
    // Try to extract unit
    Object.entries(UNIT_ALIASES).forEach(([subj, units]) => {
      Object.entries(units).forEach(([alias, unit]) => {
        if (combined.includes(alias.toLowerCase())) {
          result.unit = unit;
          result.subject = subj;
        }
      });
    });
    
    // Try to extract month
    Object.entries(MONTH_ALIASES).forEach(([alias, month]) => {
      if (combined.includes(alias.toLowerCase())) {
        result.session = month;
      }
    });
    
    // Try to extract year
    const yearMatch = combined.match(/\d{2,4}/);
    if (yearMatch) {
      const year = getYearFromString(yearMatch[0]);
      if (year) result.year = year;
    }
  }

  // Update remaining text
  result.text = words.join(' ');

  return result;
}

export function normalizeSearchTerm(term: string): string {
  // Convert to lowercase and trim
  term = term.toLowerCase().trim();

  // Replace common variations
  const variations: Record<string, string> = {
    ...SUBJECT_ALIASES,
    ...MONTH_ALIASES,
    'paper': '',
    'papers': '',
    'past': '',
    'exam': '',
    'exams': '',
    'test': '',
    'tests': '',
  };

  Object.entries(variations).forEach(([variant, replacement]) => {
    term = term.replace(new RegExp(`\\b${variant}\\b`, 'g'), replacement);
  });

  return term.trim();
}