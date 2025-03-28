export default function HomePage() {
  return (
    <div className="mt-0 md:mt-0 pt-4 sm:pt-0">
      {/* Add mobile spacing at top */}
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to PaperSite</h1>
        <p className="text-text-muted mb-6">
          Find papers, books, and study materials
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Quick access sections */}
        <section className="p-4 bg-surface rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Books</h2>
          <p className="text-text-muted">Access textbooks and solutions</p>
        </section>

        <section className="p-4 bg-surface rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Papers</h2>
          <p className="text-text-muted">Browse past papers by subject</p>
        </section>

        <section className="p-4 bg-surface rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Notes</h2>
          <p className="text-text-muted">Study materials and resources</p>
        </section>
      </div>
    </div>
  );
}
