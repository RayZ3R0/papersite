'use client';

import Link from "next/link";
import LatestPapersLink from "@/components/papers/LatestPapersLink";
import { useEffect, useState, useRef } from "react";
import { papersApi, type SubjectWithStats } from "@/lib/api/papers";

// Cache duration in milliseconds (10 minutes)
const CACHE_DURATION = 10 * 60 * 1000;

// Cache key for subjects data
const SUBJECTS_CACHE_KEY = 'papersite-subjects-cache';

// Cache interface
interface CacheData {
  data: SubjectWithStats[];
  timestamp: number;
}

// Banner Ad Component for the bottom of the page
function BottomBannerAd() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [adWidth, setAdWidth] = useState(728);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadAd = () => {
    if (!bannerRef.current) return;

    // Clear existing ad content
    bannerRef.current.innerHTML = '';

    // Load the banner ad script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      atOptions = {
        'key' : '7cdd627f9268ad1cfcc5a5362a84558f',
        'format' : 'iframe',
        'height' : 90,
        'width' : ${adWidth},
        'params' : {}
      };
    `;
    document.head.appendChild(script);

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = '//www.highperformanceformat.com/7cdd627f9268ad1cfcc5a5362a84558f/invoke.js';
    invokeScript.async = true;
    
    bannerRef.current.appendChild(invokeScript);

    // Clean up the script from head after a short delay
    setTimeout(() => {
      try {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      } catch (e) {
        // Script might already be removed
      }
    }, 1000);
  };

  useEffect(() => {
    // Only load on desktop (screen width > 768px)
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return;
    }

    // Calculate the available width for the ad
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      // Use the smaller of container width or default ad width (728px)
      setAdWidth(Math.min(containerWidth, 742));
    }

    // Handle resize events
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setAdWidth(Math.min(containerWidth, 742));
      }
    };

    window.addEventListener('resize', handleResize);

    // Load initial ad
    loadAd();

    // Set up refresh interval (30 seconds)
    refreshIntervalRef.current = setInterval(() => {
      loadAd();
    }, 30000);

    return () => {
      // Cleanup
      window.removeEventListener('resize', handleResize);
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [adWidth]);

  // Don't render on mobile
  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="hidden md:flex justify-center my-12 opacity-90 hover:opacity-100 transition-opacity max-w-full overflow-hidden"
    >
      <div className="relative max-w-full">
        <div className="text-xs text-text-muted/50 text-center mb-1">
          Advertisement
        </div>
        <div 
          ref={bannerRef}
          className="bg-surface rounded-md border border-border/30 p-1.5 shadow-sm mx-auto"
          style={{ width: `${adWidth}px`, height: '103px', maxWidth: '100%' }}
        />
      </div>
    </div>
  );
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubjects() {
      try {
        // Try to get data from cache first
        const cachedData = getCachedSubjects();
        
        if (cachedData) {
          setSubjects(cachedData);
          setLoading(false);
          
          // Refresh in background if cache is older than half the duration
          const cacheAge = Date.now() - getTimestamp();
          if (cacheAge > CACHE_DURATION / 2) {
            refreshSubjectsData();
          }
        } else {
          // No cache or expired cache, fetch fresh data
          await refreshSubjectsData();
        }
      } catch (err) {
        setError('Failed to load subjects. Please try again later.');
        console.error('Error loading subjects:', err);
        setLoading(false);
      }
    }
    
    loadSubjects();
  }, []);
  
  // Function to get cached subjects if valid
  function getCachedSubjects(): SubjectWithStats[] | null {
    try {
      if (typeof window === 'undefined') return null;
      
      const cachedData = localStorage.getItem(SUBJECTS_CACHE_KEY);
      if (!cachedData) return null;
      
      const parsedCache: CacheData = JSON.parse(cachedData);
      
      // Check if cache is still valid
      if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
        return parsedCache.data;
      }
      
      return null;
    } catch (e) {
      console.warn('Error reading from cache:', e);
      return null;
    }
  }
  
  // Function to get cache timestamp
  function getTimestamp(): number {
    try {
      if (typeof window === 'undefined') return 0;
      
      const cachedData = localStorage.getItem(SUBJECTS_CACHE_KEY);
      if (!cachedData) return 0;
      
      const parsedCache: CacheData = JSON.parse(cachedData);
      return parsedCache.timestamp;
    } catch {
      return 0;
    }
  }
  
  // Function to refresh subjects data
  async function refreshSubjectsData() {
    try {
      const data = await papersApi.getSubjects();
      
      // Update state
      setSubjects(data);
      setLoading(false);
      
      // Update cache
      if (typeof window !== 'undefined') {
        localStorage.setItem(SUBJECTS_CACHE_KEY, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      }
      
      return data;
    } catch (err) {
      // Only set error if we don't already have data
      if (subjects.length === 0) {
        setError('Failed to load subjects. Please try again later.');
        console.error('Error refreshing subjects:', err);
      }
      throw err;
    }
  }

  // Manual refresh function for the "Try Again" button
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshSubjectsData();
    } catch (err) {
      // Error already handled in refreshSubjectsData
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-alt rounded w-1/4"></div>
          <div className="h-4 bg-surface-alt rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-surface-alt rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-text mb-2">Error</h2>
          <p className="text-text-muted">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header Section */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">
            All Subjects
          </h1>
          <p className="text-text-muted">
            Browse through all available subjects and their papers
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          className="p-2 text-text-muted hover:text-primary"
          title="Refresh subjects"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </button>
      </header>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            href={`/papers/${subject.id}`}
            className="group block overflow-hidden rounded-lg border border-border 
              bg-surface hover:shadow-lg transition-all"
          >
            <div className="p-6">
              <h2
                className="text-xl font-semibold text-text group-hover:text-primary 
                transition-colors"
              >
                {subject.name}
              </h2>

              <div className="mt-3 space-y-1 text-sm text-text-muted">
                <div className="flex items-center gap-2">
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span>{subject.units.length} Units</span>
                </div>
                <div className="flex items-center gap-2">
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
                  <span>{subject.total_papers} Papers</span>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <LatestPapersLink
                  href={`/papers/${subject.id}`}
                  className="flex items-center justify-center px-4 py-2 text-sm
                    bg-surface-alt hover:bg-primary hover:text-white
                    text-text rounded-md transition-colors duration-200 
                    flex-1 font-medium"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  Latest Papers
                </LatestPapersLink>
                <Link
                  href={`/papers/${subject.id}`}
                  className="flex items-center justify-center px-4 py-2 text-sm 
                    bg-surface-alt hover:bg-primary hover:text-white
                    text-text rounded-md transition-colors duration-200 
                    flex-1 font-medium"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  View Units
                </Link>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Subtle Banner Ad at the bottom */}
      <BottomBannerAd />
    </div>
  );
}