'use client';

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="container py-6">
        <div className="h-full space-y-6">
          {children}
        </div>
      </div>
    </main>
  );
}