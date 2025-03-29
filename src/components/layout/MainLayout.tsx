'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MobileNav from './MobileNav';
import ThemePicker from './ThemePicker';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Full hide/show for mobile nav on scroll
  useEffect(() => {
    let lastScroll = 0;
    
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-text hover:text-text-muted transition-colors"
            >
              Home
            </Link>
            <Link
              href="/papers"
              className="text-text hover:text-text-muted transition-colors"
            >
              Papers
            </Link>
            <Link
              href="/books"
              className="text-text hover:text-text-muted transition-colors"
            >
              Books
            </Link>
            <Link
              href="/forum"
              className="text-text hover:text-text-muted transition-colors"
            >
              Forum
            </Link>
            <Link
              href="/search"
              className="text-text hover:text-text-muted transition-colors"
            >
              Search
            </Link>
          </nav>
          
          {/* Mobile Header Content */}
          <div className="flex md:hidden items-center justify-between w-full">
            <Link href="/">
              <div className="relative w-12 h-12 overflow-hidden rounded-lg">
                <Image
                  src="/banner.jpg"
                  alt="papersite"
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
          </div>

          {/* Theme Picker - Show on all screen sizes */}
          <div className="flex items-center">
            <ThemePicker />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Mobile Navigation - with smooth transition */}
      <div 
        className={`
          md:hidden fixed bottom-0 left-0 right-0 z-[9999]
          transform transition-transform duration-300
          ${isScrolled ? 'translate-y-full' : 'translate-y-0'}
        `}
      >
        <MobileNav />
      </div>
    </div>
  );
};

export default MainLayout;