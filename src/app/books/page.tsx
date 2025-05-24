"use client";

import { useState, useEffect, useRef } from "react";
import SubjectFilter from "@/components/books/SubjectFilter";
import BooksGrid from "@/components/books/BooksGrid";
import booksData from "@/lib/data/books.json";

const allSubjects = Array.from(
  new Set(booksData.books.map((book) => book.subject))
).filter(Boolean) as string[];

// Banner Ad Component for the bottom of the page
function BottomBannerAd() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [adWidth, setAdWidth] = useState(728);

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
    
    if (bannerRef.current) {
      bannerRef.current.appendChild(invokeScript);
    }

    return () => {
      // Cleanup
      try {
        document.head.removeChild(script);
        window.removeEventListener('resize', handleResize);
      } catch (e) {
        // Script might already be removed
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

export default function BooksPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const filteredBooks = selectedSubject
    ? booksData.books.filter((book) => book.subject === selectedSubject)
    : booksData.books;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Books</h1>
        <SubjectFilter
          subjects={allSubjects}
          selectedSubject={selectedSubject}
          onChange={setSelectedSubject}
        />
      </div>

      <BooksGrid books={filteredBooks} />
      
      {/* Banner Ad moved inside the container */}
      <BottomBannerAd />
    </div>
  );
}