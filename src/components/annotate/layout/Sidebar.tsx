'use client';

import { Subject } from '@/types/annotate';

interface SidebarProps {
  subjects: Subject[];
}

export function Sidebar({ subjects = [] }: SidebarProps) {
  return (
    <div className="hidden border-r bg-background/95 md:block w-[240px] flex-shrink-0">
      <nav className="flex flex-col h-[calc(100vh-3.5rem)]">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Subjects
            </h2>
            <div className="space-y-1">
              {subjects.map((subject) => (
                <a
                  key={subject.id}
                  href={`/annotate/${subject.id}`}
                  className="flex items-center rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  {subject.icon && (
                    <img 
                      src={subject.icon} 
                      alt="" 
                      className="mr-2 h-4 w-4"
                    />
                  )}
                  {subject.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {subject.unitCount}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}