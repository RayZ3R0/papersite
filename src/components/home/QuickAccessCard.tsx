'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface QuickAccessCardProps {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  accentColor?: string;
}

export default function QuickAccessCard({
  href,
  icon,
  title,
  description,
  accentColor = 'var(--color-primary)'
}: QuickAccessCardProps) {
  return (
    <Link 
      href={href}
      className="group relative flex flex-col h-full"
    >
      <div 
        className={`
          relative h-full rounded-2xl p-6
          bg-surface hover:bg-surface-alt
          border border-border
          transition-all duration-300 ease-out
          group-hover:scale-[1.02] group-hover:shadow-lg
        `}
        style={{
          '--hover-accent': accentColor
        } as React.CSSProperties}
      >
        {/* Icon */}
        <div 
          className="mb-4 p-3 rounded-xl bg-surface-alt w-fit
            transition-colors duration-300 group-hover:bg-surface"
        >
          <div className="w-6 h-6 text-text-muted">
            {icon}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2 text-text">
          {title}
        </h3>
        <p className="text-text-muted text-sm">
          {description}
        </p>

        {/* Hover Highlight */}
        <div 
          className={`
            absolute inset-0 rounded-2xl opacity-0
            group-hover:opacity-5 transition-opacity duration-300
          `}
          style={{ backgroundColor: accentColor }}
        />

        {/* Bottom Gradient */}
        <div 
          className={`
            absolute bottom-0 left-0 right-0 h-12
            bg-gradient-to-t from-surface to-transparent
            group-hover:from-surface-alt
            transition-colors duration-300 rounded-b-2xl
          `}
        />
      </div>
    </Link>
  );
}