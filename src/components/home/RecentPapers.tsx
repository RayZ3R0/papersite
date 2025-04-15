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
  const [viewMode, setViewMode] = useState<'recent' | 'popular'>('recent');
  
  useEffect(() => {
    if (isInView) {
      setStaggered(true);
    }
  }, [isInView]);
  
  // Get diverse set of recent papers
  const recentPapers = getBalancedRecentPapers();
  
  // Get popular papers (most accessed subjects)
  const popularPapers = getMostPopularSubjectPapers();

  // Display papers based on current view mode
  const papersToShow = viewMode === 'recent' ? recentPapers : popularPapers;
  
  // Limit display to fewer items on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Limit number of papers on mobile
  const displayLimit = isMobile ? 3 : 6;

  return (
    <section 
      ref={sectionRef}
      className="w-full max-w-7xl mx-auto px-4 py-12 md:py-16 bg-surface-alt/30"
    >
      {/* Section header with tabs for different paper views */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-text mb-3">
          Explore Papers
        </h2>
        <p className="text-text-muted max-w-xl mx-auto mb-6">
          Find the resources you need from different subjects
        </p>
        
        {/* View toggle tabs */}
        <div className="flex justify-center space-x-2 mb-4">
          <button
            onClick={() => setViewMode('recent')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${viewMode === 'recent' 
                ? 'bg-primary text-white' 
                : 'bg-surface hover:bg-surface-hover text-text-muted'}`}
          >
            Recently Added
          </button>
          <button
            onClick={() => setViewMode('popular')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${viewMode === 'popular' 
                ? 'bg-primary text-white' 
                : 'bg-surface hover:bg-surface-hover text-text-muted'}`}
          >
            Popular Subjects
          </button>
        </div>
      </motion.div>

      {/* Papers grid - responsive layout with fewer items on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papersToShow.slice(0, displayLimit).map((paper, index) => (
          <motion.div
            key={`${paper.id}-${index}`}
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
      
      {/* View all link with improved visibility */}
      <div className="mt-8 text-center">
        <Link 
          href="/papers"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary
                    hover:bg-primary/20 transition-colors
                    rounded-full font-medium"
        >
          <span>View All Papers</span>
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
            {paper.year >= 2023 ? "New" : "Popular"}
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

// Helper function to get a balanced set of recent papers from different subjects
function getBalancedRecentPapers(limit: number = 6): RecentPaper[] {
  const subjects = castSubjectsData(subjectsData).subjects;
  let papersBySubject: Record<string, RecentPaper[]> = {};
  
  // Group papers by subject
  Object.entries(subjects).forEach(([subjectId, subject]) => {
    papersBySubject[subjectId] = [];
    
    subject.papers.forEach(paper => {
      const unit = subject.units.find(u => u.id === paper.unitId);
      if (unit) {
        papersBySubject[subjectId].push({
          ...paper,
          subjectName: subject.name,
          unitName: unit.name,
          subjectId
        });
      }
    });
    
    // Sort each subject's papers by recency
    papersBySubject[subjectId].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      
      // If same year, sort by session
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
    
    // Deduplicate papers within each subject
    const seenUrls = new Set<string>();
    papersBySubject[subjectId] = papersBySubject[subjectId].filter(paper => {
      if (seenUrls.has(paper.pdfUrl)) return false;
      seenUrls.add(paper.pdfUrl);
      return true;
    });
  });
  
  // Take the most recent paper from each subject in a round-robin fashion
  const result: RecentPaper[] = [];
  const subjectIds = Object.keys(papersBySubject);
  
  // First pass: get one paper from each subject
  subjectIds.forEach(subjectId => {
    if (papersBySubject[subjectId].length > 0) {
      result.push(papersBySubject[subjectId].shift()!);
    }
  });
  
  // Second pass: fill remaining slots with the next most recent papers
  // Prioritize subjects with fewer papers in the result so far
  while (result.length < limit) {
    // Count papers per subject in current result
    const subjectCounts: Record<string, number> = {};
    result.forEach(paper => {
      subjectCounts[paper.subjectId] = (subjectCounts[paper.subjectId] || 0) + 1;
    });
    
    // Sort subjects by how many papers they already have in the result
    const sortedSubjects = [...subjectIds].sort((a, b) => {
      return (subjectCounts[a] || 0) - (subjectCounts[b] || 0);
    });
    
    // Find next subject with papers left
    let added = false;
    for (const subjectId of sortedSubjects) {
      if (papersBySubject[subjectId].length > 0) {
        result.push(papersBySubject[subjectId].shift()!);
        added = true;
        break;
      }
    }
    
    // If no more papers available, break
    if (!added) break;
  }
  
  return result.slice(0, limit);
}

// Helper function to get popular papers (one from each major subject)
function getMostPopularSubjectPapers(limit: number = 6): RecentPaper[] {
  const subjects = castSubjectsData(subjectsData).subjects;
  const result: RecentPaper[] = [];
  
  // Priority order for popular subjects
  const popularSubjectIds = [
    "physics", "chemistry", "biology", "mathematics", "economics", 
    "psychology", "sociology", "history", "geography", "english"
  ];
  
  // Filter to only subjects that exist in our data
  const availablePopularSubjects = popularSubjectIds.filter(id => subjects[id]);
  
  // Get best paper from each subject
  availablePopularSubjects.forEach(subjectId => {
    const subject = subjects[subjectId];
    if (!subject || !subject.papers.length) return;
    
    // For popular subjects, prefer recent but representative papers
    // (typically want papers from standard sessions like May/June)
    const papers = [...subject.papers]
      .filter(p => p.session && ["May", "June"].includes(p.session))
      .sort((a, b) => b.year - a.year);
    
    if (papers.length) {
      const paper = papers[0];
      const unit = subject.units.find(u => u.id === paper.unitId);
      
      if (unit) {
        result.push({
          ...paper,
          subjectName: subject.name,
          unitName: unit.name,
          subjectId
        });
      }
    }
  });
  
  return result.slice(0, limit);
}