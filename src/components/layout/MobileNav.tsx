'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavProps {
  className?: string;
}

export const MobileNav = ({ className = '' }: MobileNavProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Subjects', href: '/subjects' },
    { name: 'Search', href: '/search' },
  ];

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 bg-surface border-t 
        border-border md:hidden ${className}`}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full 
                text-sm transition-colors ${
                  isActive 
                    ? 'text-primary font-medium' 
                    : 'text-text-muted hover:text-text'
                }`}
            >
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;