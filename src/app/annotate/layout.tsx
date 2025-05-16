'use client';

import { ReactNode } from 'react';

interface AnnotateLayoutProps {
  children: ReactNode;
}

export default function AnnotateLayout({ children }: AnnotateLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background">
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}