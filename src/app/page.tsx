'use client';

import Link from 'next/link';
import SimpleSearch from '@/components/search/SimpleSearch';

export default function Home() {
  // Placeholder data - will be replaced with real data later
  const subjects = [
    { id: 'physics', name: 'Physics' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'mathematics', name: 'Mathematics' },
  ];

  return (
    <div className="space-y-6">
      {/* Mobile-optimized search bar */}
      <SimpleSearch />

      {/* Subject Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            href={`/subjects/${subject.id}`}
            className="group relative overflow-hidden rounded-lg 
              shadow-md hover:shadow-lg transition-all"
          >
            <div className="p-6 bg-surface border border-border">
              <h3 className="text-lg font-semibold text-text 
                group-hover:text-primary transition-colors">
                {subject.name}
              </h3>
              <div className="mt-2 flex items-center text-sm text-text-muted">
                <span>6 units available</span>
                <span className="mx-2">•</span>
                <span>Multiple sessions</span>
              </div>
              {/* Quick access buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="px-3 py-1 text-sm bg-surface-alt hover:bg-surface-alt/80 
                  text-text rounded-full transition-colors">
                  Latest Papers
                </button>
                <button className="px-3 py-1 text-sm bg-surface-alt hover:bg-surface-alt/80 
                  text-text rounded-full transition-colors">
                  All Units
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links Section */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-text">Quick Access</h2>
        <div className="space-y-4">
          <Link
            href="/search"
            className="block p-4 bg-surface border border-border rounded-lg 
              shadow-sm hover:shadow transition-all group"
          >
            <h3 className="font-medium text-text">Advanced Search</h3>
            <p className="text-sm text-text-muted">
              Search across all subjects and sessions
            </p>
            <span className="mt-2 text-sm text-primary group-hover:text-primary-dark 
              dark:group-hover:text-primary-light transition-colors inline-block">
              Learn more →
            </span>
          </Link>
          <Link
            href="/latest"
            className="block p-4 bg-surface border border-border rounded-lg 
              shadow-sm hover:shadow transition-all group"
          >
            <h3 className="font-medium text-text">Latest Papers</h3>
            <p className="text-sm text-text-muted">
              Access the most recent past papers
            </p>
            <span className="mt-2 text-sm text-primary group-hover:text-primary-dark 
              dark:group-hover:text-primary-light transition-colors inline-block">
              View all →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
