'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import MobileNav from './MobileNav';
import ThemePicker from './ThemePicker';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      {/* Header - Hidden on mobile when viewing PDFs */}
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
              href="/subjects"
              className="text-text hover:text-text-muted transition-colors"
            >
              Subjects
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
            <h1 className="text-xl font-bold text-text">Past Papers</h1>
          </div>

          {/* Theme Picker - Show on all screen sizes */}
          <div className="flex items-center">
            <ThemePicker />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 md:pb-6 pb-24">
        {children}
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default MainLayout;