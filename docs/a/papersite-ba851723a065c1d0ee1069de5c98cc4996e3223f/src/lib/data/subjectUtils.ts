import subjectsData from './subjects.json';
import { Subject, Paper, Unit, SubjectsData } from '@/types';

// Type assertion for the imported JSON
const typedSubjectsData = subjectsData as SubjectsData;

export const getAllSubjects = (): { [key: string]: Subject } => {
  return typedSubjectsData.subjects;
};

export const getSubject = (id: string): Subject | null => {
  return typedSubjectsData.subjects[id] || null;
};

export const getSubjectUnits = (subjectId: string): Unit[] => {
  const subject = getSubject(subjectId);
  return subject?.units || [];
};

export const getUnitPapers = (subjectId: string, unitId: string): Paper[] => {
  const subject = getSubject(subjectId);
  return subject?.papers.filter(paper => paper.unitId === unitId) || [];
};

export const getPapersBySession = (year: number, session: string): Paper[] => {
  const allPapers: Paper[] = [];
  Object.values(typedSubjectsData.subjects).forEach(subject => {
    subject.papers.forEach(paper => {
      if (paper.year === year && paper.session === session) {
        allPapers.push({
          ...paper,
          subject: subject.name
        });
      }
    });
  });
  return allPapers;
};

export const searchPapers = (query: string): Paper[] => {
  const searchTerm = query.toLowerCase();
  const allPapers: Paper[] = [];
  
  Object.values(typedSubjectsData.subjects).forEach(subject => {
    subject.papers.forEach(paper => {
      if (
        paper.title.toLowerCase().includes(searchTerm) ||
        subject.name.toLowerCase().includes(searchTerm)
      ) {
        allPapers.push({
          ...paper,
          subject: subject.name
        });
      }
    });
  });
  
  return allPapers;
};

// Helper to validate data structure
export const validateSubjectData = (subject: Subject): boolean => {
  const requiredFields = ['id', 'name', 'units', 'papers'];
  return requiredFields.every(field => field in subject);
};

// Helper to format paper ID consistently
export const generatePaperId = (
  subjectId: string,
  year: number,
  session: string,
  unitId: string
): string => {
  return `${subjectId}-${year}-${session.toLowerCase()}-${unitId}`;
};

// Helper to get available years
export const getAvailableYears = (): number[] => {
  const years = new Set<number>();
  Object.values(typedSubjectsData.subjects).forEach(subject => {
    subject.papers.forEach(paper => {
      years.add(paper.year);
    });
  });
  return Array.from(years).sort((a, b) => b - a); // Sort descending
};

// Helper to get available sessions
export const getAvailableSessions = (): string[] => {
  const sessions = new Set<string>();
  Object.values(typedSubjectsData.subjects).forEach(subject => {
    subject.papers.forEach(paper => {
      sessions.add(paper.session);
    });
  });
  return Array.from(sessions).sort();
};

// Helper to get papers with marking schemes
export const getPapersWithMarkingSchemes = (): Paper[] => {
  const papersWithSchemes: Paper[] = [];
  Object.values(typedSubjectsData.subjects).forEach(subject => {
    subject.papers.forEach(paper => {
      if (paper.markingSchemeUrl && paper.markingSchemeUrl !== '#') {
        papersWithSchemes.push({
          ...paper,
          subject: subject.name
        });
      }
    });
  });
  return papersWithSchemes;
};

// Helper to get unit by ID
export const getUnit = (subjectId: string, unitId: string): Unit | null => {
  const subject = getSubject(subjectId);
  return subject?.units.find(unit => unit.id === unitId) || null;
};