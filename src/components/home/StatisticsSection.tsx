'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { papersApi } from '@/lib/api/papers';

// Interface for statistics data
interface Statistics {
  totalPapers: number;
  totalSubjects: number;
  totalUnits: number;
}

export default function StatisticsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [stats, setStats] = useState<Statistics>({
    totalPapers: 0,
    totalSubjects: 0,
    totalUnits: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const subjects = await papersApi.getSubjects();
        const totalUnits = subjects.reduce((sum, subject) => sum + subject.units.length, 0);
        
        let totalPapers = 0;
        let unitsProcessed = 0;
        const sampleSize = Math.min(5, totalUnits); // Reduced sample size for faster loading
        
        const unitPromises = [];
        
        for (const subject of subjects) {
          if (subject.units.length > 0 && unitsProcessed < sampleSize) {
            const unitSamplePromise = papersApi.getUnitSummary(subject.id, subject.units[0].id)
              .then(summary => {
                if (summary.total_papers) {
                  totalPapers += summary.total_papers * subject.units.length;
                  unitsProcessed++;
                }
              })
              .catch(error => {
                console.error(`Failed to fetch unit summary for ${subject.id}:`, error);
              });
            
            unitPromises.push(unitSamplePromise);
          }
        }
        
        await Promise.all(unitPromises);
        
        if (totalPapers === 0) {
          totalPapers = totalUnits * 20;
        }
        
        setStats({
          totalPapers,
          totalSubjects: subjects.length,
          totalUnits
        });
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
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
            value={stats.totalPapers} 
            label="Past Papers"
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            delay={0}
            isLoading={isLoading}
          />
          
          <StatItem 
            value={stats.totalSubjects} 
            label="Subjects"
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            delay={0.2}
            isLoading={isLoading}
          />
          
          <StatItem 
            value={stats.totalUnits} 
            label="Units"
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            }
            delay={0.4}
            isLoading={isLoading}
          />
        </motion.div>
      </div>
    </section>
  );
}

// Stat Item Component with enhanced animations
interface StatItemProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  delay: number;
  isLoading?: boolean;
}

function StatItem({ value, label, icon, delay, isLoading = false }: StatItemProps) {
  return (
    <motion.div
      className="flex flex-col items-center p-6 rounded-xl bg-surface/50 backdrop-blur-sm border border-border/30 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <motion.div 
        className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-primary/10 text-primary"
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(var(--color-primary-rgb), 0.15)' }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.div>
      
      {isLoading ? (
        <div className="text-3xl md:text-4xl font-bold text-text h-10 w-20 animate-pulse bg-surface-alt/50 rounded" />
      ) : (
        <CountUpAnimation target={value} duration={2.5} delay={delay} />
      )}
      
      <p className="text-lg text-text-muted mt-1">{label}</p>
    </motion.div>
  );
}

// Enhanced count-up animation
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