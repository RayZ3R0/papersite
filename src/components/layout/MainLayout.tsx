'use client';

import { useNavigation } from '@/hooks/useNavigation';
import { Sidebar } from './Sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, isMobile, toggleSidebar } = useNavigation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation - Desktop Only */}
      {!isMobile && (
        <header className="h-16 fixed top-0 right-0 left-64 z-20 bg-surface 
          border-b border-border px-4 flex items-center justify-between transition-all">
          {/* Page Title - Could be made dynamic */}
          <h1 className="text-xl font-semibold text-text">PaperSite</h1>
          
          {/* Right side actions could go here */}
          <div className="flex items-center space-x-4">
            {/* Add any header actions here */}
          </div>
        </header>
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => toggleSidebar()}
        isMobile={isMobile}
      />

      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-surface border-b 
          border-border px-4 flex items-center justify-between z-20">
          {/* Mobile Menu Button */}
          <button
            onClick={() => toggleSidebar()}
            className="p-2 rounded-lg hover:bg-surface-alt transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-text"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <h1 className="text-xl font-semibold text-text">PaperSite</h1>

          {/* Placeholder for right side of mobile header */}
          <div className="w-10" />
        </header>
      )}

      {/* Main Content */}
      <main
        className={`transition-all duration-300 min-h-screen ${
          isMobile
            ? 'pt-16 pb-6' // Mobile padding
            : 'pt-16 pl-64' // Desktop padding (with sidebar)
        }`}
      >
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}