'use client';

import { ReactNode } from 'react';
import MobileNav from './MobileNav';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Hidden on mobile when viewing PDFs */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-900 hover:text-gray-600">Home</a>
            <a href="/subjects" className="text-gray-900 hover:text-gray-600">Subjects</a>
            <a href="/search" className="text-gray-900 hover:text-gray-600">Search</a>
          </nav>
          
          {/* Mobile Header Content */}
          <div className="flex md:hidden items-center justify-between w-full">
            <h1 className="text-xl font-bold">Past Papers</h1>
            {/* Add mobile search toggle button here if needed */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default MainLayout;