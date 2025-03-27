'use client';

import { useEffect } from 'react';
import booksData from '@/lib/data/books.json';
import BooksGrid from '@/components/books/BooksGrid';

export default function BooksPage() {
  // Close any open side trays when navigating away
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">Books</h1>
        <p className="mt-2 text-text-muted">
          Access textbooks and their solutions. Click on a book to view available resources.
        </p>
      </div>

      <BooksGrid books={booksData.books} />
    </div>
  );
}