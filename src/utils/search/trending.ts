interface TrendingSearch {
  query: string;
  count: number;
  lastUsed: number;
}

const TRENDING_SEARCHES_KEY = 'papersite:trending-searches';
const MAX_TRENDING = 10;
const TRENDING_DECAY_DAYS = 7; // Searches older than this will have reduced weight

export function logSearchQuery(query: string) {
  if (typeof window === 'undefined') return;
  
  try {
    // Get existing trending searches
    const stored = localStorage.getItem(TRENDING_SEARCHES_KEY);
    const trending: TrendingSearch[] = stored ? JSON.parse(stored) : [];
    
    // Find if this query already exists
    const existingIndex = trending.findIndex(t => t.query === query);
    const now = Date.now();
    
    if (existingIndex >= 0) {
      // Update existing query
      trending[existingIndex] = {
        ...trending[existingIndex],
        count: trending[existingIndex].count + 1,
        lastUsed: now
      };
    } else {
      // Add new query
      trending.push({
        query,
        count: 1,
        lastUsed: now
      });
    }

    // Calculate scores and sort
    const scoredTrending = trending
      .map(t => {
        const daysOld = (now - t.lastUsed) / (1000 * 60 * 60 * 24);
        const decayFactor = Math.max(0, 1 - (daysOld / TRENDING_DECAY_DAYS));
        const score = t.count * decayFactor;
        return { ...t, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_TRENDING);

    // Store updated trending searches
    localStorage.setItem(
      TRENDING_SEARCHES_KEY,
      JSON.stringify(scoredTrending.map(({ score, ...rest }) => rest))
    );
  } catch {
    // Ignore storage errors
  }
}

export function getTrendingSearches(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(TRENDING_SEARCHES_KEY);
    if (!stored) return [];

    const trending: TrendingSearch[] = JSON.parse(stored);
    const now = Date.now();

    // Filter out old searches and sort by count
    return trending
      .filter(t => {
        const daysOld = (now - t.lastUsed) / (1000 * 60 * 60 * 24);
        return daysOld <= TRENDING_DECAY_DAYS;
      })
      .sort((a, b) => b.count - a.count)
      .map(t => t.query);
  } catch {
    return [];
  }
}

// Get unique subjects from trending searches
export function getTrendingSubjects(): string[] {
  const trending = getTrendingSearches();
  const subjects = new Set<string>();

  trending.forEach(query => {
    const words = query.toLowerCase().split(/\s+/);
    ['physics', 'chemistry', 'mathematics', 'biology'].forEach(subject => {
      if (words.includes(subject) || words.includes(subject.slice(0, 3))) {
        subjects.add(subject);
      }
    });
  });

  return Array.from(subjects);
}