import Link from 'next/link';

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
      <div className="relative mb-8">
        <input
          type="search"
          placeholder="Search papers..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Subject Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            href={`/subjects/${subject.id}`}
            className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-6 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                {subject.name}
              </h3>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span>6 units available</span>
                <span className="mx-2">•</span>
                <span>Multiple sessions</span>
              </div>
              {/* Quick access buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full">
                  Latest Papers
                </button>
                <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full">
                  All Units
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links Section */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="space-y-4">
          <Link
            href="/search"
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium">Advanced Search</h3>
            <p className="text-sm text-gray-500">
              Search across all subjects and sessions
            </p>
          </Link>
          <Link
            href="/latest"
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium">Latest Papers</h3>
            <p className="text-sm text-gray-500">
              Access the most recent past papers
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
