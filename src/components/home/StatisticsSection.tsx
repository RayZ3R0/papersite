'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import subjectsData from '@/lib/data/subjects.json';
import { SubjectsData } from '@/types/subject';

// Type assertion helper
const castSubjectsData = (data: any): SubjectsData => data as SubjectsData;

export default function StatisticsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  
  const { totalPapers, totalSubjects, totalUnits } = getStats();
  
  return (
    <section 
      ref={sectionRef}
      className="w-full py-20 md:py-24 bg-gradient-to-b from-background to-surface-alt/20"
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <StatItem 
            value={totalPapers} 
            label="Past Papers"
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            delay={0}
          />
          
          <StatItem 
            value={totalSubjects} 
            label="Subjects"
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            delay={0.2}
          />
          
          <StatItem 
            value={totalUnits} 
            label="Units"
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            }
            delay={0.4}
          />
        </motion.div>
      </div>
    </section>
  );
}

interface StatItemProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  delay: number;
}

function StatItem({ value, label, icon, delay }: StatItemProps) {
  return (
    <motion.div
      className="flex flex-col items-center p-6 rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      
      <CountUpAnimation target={value} duration={2.5} delay={delay} />
      
      <p className="text-lg text-text-muted mt-1">{label}</p>
    </motion.div>
  );
}

// Animated count-up component
function CountUpAnimation({ target, duration, delay }: { target: number, duration: number, delay: number }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(nodeRef, { once: true });
  
  useEffect(() => {
    if (!isInView || !nodeRef.current) return;
    
    let startTime: number;
    let animationFrame: number;
    const startValue = 0;
    
    // Format with commas
    const formatNumber = (num: number) => {
      return Math.round(num).toLocaleString();
    };
    
    const updateValue = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const currentValue = startValue + (target - startValue) * easeOutQuart(progress);
      
      if (nodeRef.current) {
        nodeRef.current.textContent = formatNumber(currentValue);
      }
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateValue);
      }
    };
    
    // Start animation after delay
    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(updateValue);
    }, delay * 1000);
    
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrame);
    };
  }, [isInView, target, duration, delay]);
  
  return (
    <div className="text-3xl md:text-4xl font-bold text-text" ref={nodeRef}>
      0
    </div>
  );
}

// Easing function
function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}

// Helper function to calculate statistics
function getStats() {
  const { subjects } = castSubjectsData(subjectsData);
  
  // Count subjects
  const totalSubjects = Object.keys(subjects).length;
  
  // Count units across all subjects
  const totalUnits = Object.values(subjects).reduce(
    (sum, subject) => sum + subject.units.length, 
    0
  );
  
  // Count unique papers (deduplicated by URL)
  const paperUrls = new Set<string>();
  Object.values(subjects).forEach(subject => {
    subject.papers.forEach(paper => {
      paperUrls.add(paper.pdfUrl);
    });
  });
  
  return {
    totalPapers: paperUrls.size,
    totalSubjects,
    totalUnits
  };
}