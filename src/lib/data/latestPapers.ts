import { SubjectsData, Paper } from '@/types/subject';
import subjectsData from './subjects.json';

interface PaperWithSubject extends Paper {
  subjectId: string;
  subjectName: string;
}

// Normalize session names (combine May/June)
const normalizeSession = (session: string) => {
  return session === 'May' || session === 'June' ? 'May/June' : session;
};

// Helper function to determine which session is more recent
const isMoreRecentSession = (a: Paper, b: Paper) => {
  if (a.year !== b.year) {
    return a.year > b.year;
  }
  
  const sessions = ['January', 'May/June', 'October'];
  const normalizedA = normalizeSession(a.session);
  const normalizedB = normalizeSession(b.session);
  return sessions.indexOf(normalizedA) > sessions.indexOf(normalizedB);
};

export const getLatestPapers = () => {
  const { subjects } = subjectsData as SubjectsData;
  let allPapers: PaperWithSubject[] = [];
  
  // Collect papers from all subjects
  Object.entries(subjects).forEach(([subjectId, subject]) => {
    const papersWithSubject = subject.papers.map(paper => ({
      ...paper,
      subjectId,
      subjectName: subject.name
    }));
    allPapers = [...allPapers, ...papersWithSubject];
  });

  // Get the most recent year and normalized session
  const mostRecentPaper = allPapers.reduce((mostRecent, current) => {
    return isMoreRecentSession(current, mostRecent) ? current : mostRecent;
  }, allPapers[0]);

  const mostRecentNormalizedSession = normalizeSession(mostRecentPaper.session);

  // Filter papers from the most recent session
  return allPapers.filter(paper => {
    const paperNormalizedSession = normalizeSession(paper.session);
    return paper.year === mostRecentPaper.year && 
           paperNormalizedSession === mostRecentNormalizedSession;
  });
};