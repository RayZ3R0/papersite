'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import subjectsData from '@/lib/data/subjects.json';
import type { SubjectsData, Paper } from '@/types/subject';

// Type assertion helper
const castSubjectsData = (data: any): SubjectsData => data as SubjectsData;

interface RecentPaper extends Paper {
  subjectName: string;
  unitName: string;
  subjectId: string;
}

export default function RecentPapers() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [staggered, setStaggered] = useState(false);
  
  useEffect(() => {
    if (isInView) {
      setStaggered(true);
    }
  }, [isInView]);
  
  // Get most recent papers
  const recentPapers = getRecentPapers(10);

  return (
    <section 
      ref={sectionRef}
      className="w-full max-w-7xl mx-auto px-4 py-16 bg-surface-alt/30"
    >
      {/* Section header with animation */}
      <motion.div 
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-text mb-3">
          Recently Added Papers
        </h2>
        <p className="text-text-muted max-w-xl mx-auto">
          Stay up to date with the latest additions to our library
        </p>
      </motion.div>

      {/* Papers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentPapers.map((paper, index) => (
          <motion.div
            key={paper.id}
            initial={{ opacity: 0, y: 20 }}
            animate={staggered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.5, 
              delay: Math.min(0.1 + index * 0.1, 0.8),
              ease: "easeOut"
            }}
          >
            <PaperCard paper={paper} />
          </motion.div>
        ))}
      </div>
      
      {/* View all link */}
      <div className="mt-10 text-center">
        <Link 
          href="/papers"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-surface border border-border
                    hover:bg-surface-alt hover:border-primary/30 transition-colors
                    rounded-full text-text hover:text-primary"
        >
          <span>View all papers</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

// Helper component for paper cards
function PaperCard({ paper }: { paper: RecentPaper }) {
  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden hover:shadow-md hover:border-border-light transition-all">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium text-text">
              {paper.subjectName} - {paper.unitName}
            </h3>
            <p className="text-sm text-text-muted">
              {paper.session} {paper.year}
            </p>
          </div>
          <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
            New
          </span>
        </div>
        
        <div className="flex gap-2 mt-4">
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 
                      bg-primary text-white rounded-lg hover:opacity-90 
                      transition-colors"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            Question Paper
          </a>
          <a
            href={paper.markingSchemeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2
                      bg-secondary text-white rounded-lg hover:opacity-90
                      transition-colors"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
              />
            </svg>
            MS
          </a>
        </div>
      </div>
      
      {/* Subject link */}
      <div className="bg-surface-alt/50 py-2 px-4 border-t border-border">
        <Link 
          href={`/papers/${paper.subjectId}`}
          className="text-sm text-text-muted hover:text-primary transition-colors flex items-center justify-between"
        >
          <span>View subject</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// Helper function to get recent papers
function getRecentPapers(limit: number = 6): RecentPaper[] {
  const subjects = castSubjectsData(subjectsData).subjects;
  const papers: RecentPaper[] = [];
  
  // Get all papers with subject and unit info
  Object.entries(subjects).forEach(([subjectId, subject]) => {
    subject.papers.forEach(paper => {
      const unit = subject.units.find(u => u.id === paper.unitId);
      if (unit) {
        papers.push({
          ...paper,
          subjectName: subject.name,
          unitName: unit.name,
          subjectId
        });
      }
    });
  });
  
  // Sort by year and session (most recent first)
  papers.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    
    // If same year, sort by session (May/June comes before October)
    const sessionOrder: Record<string, number> = {
      'October': 1,
      'November': 2,
      'May': 3,
      'June': 4, 
      'January': 5,
      'February': 6
    };
    
    return (sessionOrder[b.session] || 0) - (sessionOrder[a.session] || 0);
  });
  
  // Deduplicate papers based on pdfUrl
  const seenUrls = new Set<string>();
  const uniquePapers = papers.filter(paper => {
    if (seenUrls.has(paper.pdfUrl)) return false;
    seenUrls.add(paper.pdfUrl);
    return true;
  });
  
  return uniquePapers.slice(0, limit);
}