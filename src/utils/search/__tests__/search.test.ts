import { searchPapers } from '../core';
import { parseSearchQuery } from '../queryParser';
import { SubjectsData } from '@/types/subject';

const mockData: SubjectsData = {
  subjects: {
    physics: {
      id: 'physics',
      name: 'Physics',
      units: [
        {
          id: 'unit1',
          name: 'Mechanics',
          order: 1,
          description: 'Forces and motion'
        },
        {
          id: 'unit2',
          name: 'Waves',
          order: 2,
          description: 'Wave phenomena'
        }
      ],
      papers: [
        {
          id: 'phys-mech-jan24',
          unitId: 'unit1',
          year: 2024,
          session: 'January',
          pdfUrl: '#',
          markingSchemeUrl: '#',
          title: 'Physics Mechanics January 2024'
        },
        {
          id: 'phys-waves-oct23',
          unitId: 'unit2',
          year: 2023,
          session: 'October',
          pdfUrl: '#',
          markingSchemeUrl: '#',
          title: 'Physics Waves October 2023'
        }
      ]
    },
    mathematics: {
      id: 'mathematics',
      name: 'Mathematics',
      units: [
        {
          id: 'pure1',
          name: 'Pure Mathematics 1',
          order: 1,
          description: 'P1'
        }
      ],
      papers: [
        {
          id: 'math-p1-jun23',
          unitId: 'pure1',
          year: 2023,
          session: 'June',
          pdfUrl: '#',
          markingSchemeUrl: '#',
          title: 'Mathematics P1 June 2023'
        }
      ]
    }
  }
};

describe('Search Functionality', () => {
  describe('Query Parser', () => {
    it('parses subject shortcuts', () => {
      expect(parseSearchQuery('phy mech jan 24')).toEqual({
        subject: 'physics',
        unit: 'mechanics',
        year: 2024,
        session: 'january',
        text: ''
      });
    });

    it('parses combined formats', () => {
      expect(parseSearchQuery('p1jan21')).toEqual({
        subject: 'physics',
        unit: 'mechanics',
        year: 2021,
        session: 'january',
        text: ''
      });
    });

    it('handles partial year formats', () => {
      expect(parseSearchQuery('physics waves oct 23')).toEqual({
        subject: 'physics',
        unit: 'waves',
        year: 2023,
        session: 'october',
        text: ''
      });
    });
  });

  describe('Search Results', () => {
    it('finds papers with short queries', () => {
      const { results } = searchPapers(
        { text: 'phy jan 24' },
        mockData
      );
      expect(results).toHaveLength(1);
      expect(results[0].paper.id).toBe('phys-mech-jan24');
    });

    it('finds papers with unit abbreviations', () => {
      const { results } = searchPapers(
        { text: 'p1 june 23' },
        mockData
      );
      expect(results).toHaveLength(1);
      expect(results[0].subject.name).toBe('Mathematics');
      expect(results[0].unit.name).toBe('Pure Mathematics 1');
    });

    it('provides suggestions when no exact matches', () => {
      const { suggestions } = searchPapers(
        { text: 'phy dec 23' },
        mockData
      );
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].type).toBe('subject');
    });

    it('handles combined search terms', () => {
      const { results } = searchPapers(
        { text: 'mechjan24' },
        mockData
      );
      expect(results).toHaveLength(1);
      expect(results[0].paper.id).toBe('phys-mech-jan24');
    });

    it('ranks recent papers higher', () => {
      const { results } = searchPapers(
        { text: 'physics' },
        mockData
      );
      expect(results[0].paper.year).toBe(2024);
    });
  });
});