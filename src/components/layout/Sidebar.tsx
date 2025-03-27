'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

interface NavItem {
  name: string;
  href: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
}

// Navigation items
const navigation: NavItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
        />
      </svg>
    )
  },
  {
    name: 'Subjects',
    href: '/subjects',
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    )
  },
  {
    name: 'Latest Papers',
    href: '/latest',
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    )
  }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);

  // Helper to determine if a link is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const sidebarWidth = expanded ? 'w-64' : 'w-20';
  const sidebarClasses = `
    ${sidebarWidth}
    transition-all
    duration-300
    ease-in-out
    flex
    flex-col
    bg-surface
    border-r
    border-border
    fixed
    top-0
    bottom-0
    left-0
    z-40
    ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : ''}
  `;

  return (
    <>
      {/* Sidebar Backdrop (Mobile) */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClasses}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {expanded && (
            <h1 className="text-xl font-semibold text-text">PaperSite</h1>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-2 rounded-lg hover:bg-surface-alt transition-colors
              ${isMobile ? 'hidden' : ''}`}
          >
            <svg
              className="w-5 h-5 text-text"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={expanded 
                  ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" 
                  : "M13 5l7 7-7 7M5 5l7 7-7 7"
                }
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors
                ${isActive(item.href) 
                  ? 'bg-primary text-white' 
                  : 'text-text hover:bg-surface-alt'}`}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              {expanded && (
                <span className="ml-3">{item.name}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            {expanded && (
              <span className="text-sm text-text-muted">v1.0.0</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}