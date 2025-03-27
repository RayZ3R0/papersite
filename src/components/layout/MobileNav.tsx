'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome, IconSearch, IconBook, IconMessages } from './icons';

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          <Link
            href="/"
            className={`flex flex-col items-center ${
              pathname === '/' ? 'text-primary' : 'text-text-muted'
            }`}
          >
            <IconHome className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link
            href="/books"
            className={`flex flex-col items-center ${
              pathname.startsWith('/books') ? 'text-primary' : 'text-text-muted'
            }`}
          >
            <IconBook className="w-6 h-6" />
            <span className="text-xs mt-1">Books</span>
          </Link>

          <Link
            href="/forum"
            className={`flex flex-col items-center ${
              pathname.startsWith('/forum') ? 'text-primary' : 'text-text-muted'
            }`}
          >
            <IconMessages className="w-6 h-6" />
            <span className="text-xs mt-1">Forum</span>
          </Link>

          <Link
            href="/search"
            className={`flex flex-col items-center ${
              pathname === '/search' ? 'text-primary' : 'text-text-muted'
            }`}
          >
            <IconSearch className="w-6 h-6" />
            <span className="text-xs mt-1">Search</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}