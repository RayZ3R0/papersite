'use client';

export default function LoadingProfile() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-24 h-24 bg-surface-alt rounded-full" />
        <div className="space-y-3 flex-1">
          <div className="h-6 bg-surface-alt rounded w-48" />
          <div className="h-4 bg-surface-alt rounded w-32" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 bg-surface rounded-lg">
            <div className="h-4 bg-surface-alt rounded w-20 mb-2" />
            <div className="h-6 bg-surface-alt rounded w-16" />
          </div>
        ))}
      </div>

      {/* Subjects skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-surface-alt rounded w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 bg-surface rounded-lg">
              <div className="h-5 bg-surface-alt rounded w-3/4 mb-3" />
              <div className="space-y-2">
                <div className="h-4 bg-surface-alt rounded w-1/2" />
                <div className="h-4 bg-surface-alt rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-surface-alt rounded w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-4 bg-surface rounded-lg">
              <div className="h-4 bg-surface-alt rounded w-1/2 mb-3" />
              <div className="h-4 bg-surface-alt rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}