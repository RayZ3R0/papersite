'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';

interface QueryPreservingLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  scroll?: boolean;
}

export default function QueryPreservingLink({
  href,
  children,
  className,
  prefetch,
  scroll,
}: QueryPreservingLinkProps) {
  const searchParams = useSearchParams();
  const catParam = searchParams?.get('cat');
  
  // If cat=true is in the URL, make sure we keep it when navigating
  const preservedHref = catParam === 'true' 
    ? `${href}${href.includes('?') ? '&' : '?'}cat=true`
    : href;

  return (
    <Link 
      href={preservedHref}
      className={className}
      prefetch={prefetch}
      scroll={scroll}
    >
      {children}
    </Link>
  );
}