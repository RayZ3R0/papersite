'use client';

import { useState, useEffect, useRef } from 'react';
import { papersApi, Paper, SubjectWithStats } from '@/lib/api/papers';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import PaperCard from '@/components/papers/PaperCard';
import FilterControls from '@/components/papers/FilterControls';

export default function LatestPapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [subjects, setSubjects] = useState<SubjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const subjectRefs = useRef<Record<string, HTMLElement | null>>({});

  // Handle hash change and initial hash
  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (hash) {
        // Convert hash to subject name format (e.g., chemistry -> Chemistry)
        const formattedHash = hash.charAt(0).toUpperCase() + hash.slice(1).toLowerCase();
        
        // Set the subject as expanded
        setExpandedSubjects(prev => ({
          ...prev,
          [formattedHash]: true
        }));

        // Scroll to the subject section
        setTimeout(() => {
          const element = subjectRefs.current[formattedHash];
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }

    // Set all subjects as collapsed initially
    setExpandedSubjects({});

    // Handle hash on initial load and hash changes
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch subjects and papers
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch subjects and papers in parallel
        const [subjectsData] = await Promise.all([
          papersApi.getSubjects()
        ]);

        setSubjects(subjectsData);
        
        // Get most recent papers for each subject
        const allPapers: Paper[] = [];
        for (const subject of subjectsData) {
          if (subject.units && subject.units.length > 0) {
            const unitPapers = await papersApi.getUnitPapers(subject.id, subject.units[0].id);
            allPapers.push(...unitPapers.map(paper => ({ ...paper, subject_name: subject.name })));
          }
        }

        setPapers(allPapers);
      } catch (err) {
        setError('Failed to load papers. Please try again later.');
        console.error('Error fetching papers:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter papers based on search query and filters
  const filteredPapers = papers.filter(paper => {
    const matchesSearch = !searchQuery || 
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (paper.subject_name && paper.subject_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSession = !selectedSession || paper.session === selectedSession;
    const matchesYear = !selectedYear || paper.year.toString() === selectedYear;

    return matchesSearch && matchesSession && matchesYear;
  });

  // Group papers by subject
  const papersBySubject = filteredPapers.reduce((acc, paper) => {
    if (!paper.subject_name) return acc;
    const subjectPapers = acc[paper.subject_name] || [];
    return {
      ...acc,
      [paper.subject_name]: [...subjectPapers, paper]
    };
  }, {} as Record<string, Paper[]>);

  // Get unique sessions and years for filters
  const availableSessions = Array.from(new Set(papers.map(p => p.session))).sort();
  const availableYears = Array.from(new Set(papers.map(p => p.year.toString()))).sort().reverse();

  // Toggle subject expansion
  const toggleSubject = (subject: string) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));

    // Update URL hash when expanding a subject
    if (!expandedSubjects[subject]) {
      const hash = subject.toLowerCase();
      window.history.pushState(null, '', `#${hash}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorDisplay 
          message={error}
          retry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">
          Latest Papers
        </h1>
        <p className="text-text-muted">
          Browse the most recent papers across all subjects
        </p>
      </header>

      {/* Filters */}
      <FilterControls
        onSearch={setSearchQuery}
        onSessionChange={setSelectedSession}
        onYearChange={setSelectedYear}
        availableSessions={availableSessions}
        availableYears={availableYears}
        isLoading={loading}
      />

      {/* Papers by Subject */}
      <div className="space-y-4">
        {Object.entries(papersBySubject).map(([subjectName, papers]) => (
          <section 
            key={subjectName} 
            ref={el => subjectRefs.current[subjectName] = el}
            className="bg-surface rounded-lg border border-border scroll-mt-24"
          >
            {/* Subject Header - Always visible */}
            <button
              onClick={() => toggleSubject(subjectName)}
              className="w-full p-4 border-b border-border flex items-center justify-between 
                hover:bg-surface-alt transition-colors"
            >
              <div>
                <h2 className="text-xl font-semibold text-text">
                  {subjectName}
                </h2>
                <p className="text-sm text-text-muted mt-1">
                  {papers.length} {papers.length === 1 ? 'paper' : 'papers'} available
                </p>
              </div>
              <div className="transform transition-transform duration-200" 
                style={{ transform: expandedSubjects[subjectName] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <svg 
                  className="w-5 h-5 text-text-muted" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </div>
            </button>

            {/* Papers List - Collapsible */}
            <div 
              className={`overflow-hidden transition-all duration-200 ease-in-out
                ${expandedSubjects[subjectName] ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="divide-y divide-border">
                {papers.map((paper) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}