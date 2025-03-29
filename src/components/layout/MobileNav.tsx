'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookIcon, FileTextIcon, GridIcon, MessageCircleIcon, SearchIcon } from './icons';

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}

export default function MobileNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-surface border-t border-border">
      <div className="flex items-center justify-around h-16">
        <NavLink 
          href="/books" 
          icon={BookIcon}
          label="Books"
          active={isActive('/books')}
        />
        <NavLink 
          href="/papers" 
          icon={FileTextIcon}
          label="Papers"
          active={isActive('/papers')}
        />
        <NavLink 
          href="/forum" 
          icon={MessageCircleIcon}
          label="Forum"
          active={isActive('/forum')}
        />
        <NavLink 
          href="/notes" 
          icon={GridIcon}
          label="Notes"
          active={isActive('/notes')}
        />
        <NavLink 
          href="/search" 
          icon={SearchIcon}
          label="Search"
          active={isActive('/search')}
        />
      </div>
    </nav>
  );
}

function NavLink({ href, icon: Icon, label, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center
        min-w-[4rem] py-1 rounded-lg transition-colors
        ${active 
          ? 'text-primary' 
          : 'text-text-muted hover:text-text'
        }`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs mt-0.5">{label}</span>
    </Link>
  );
}