'use client';

import { useState, useMemo } from 'react';
import { Book, SubjectFilter as SubjectFilterType } from '@/types/book';
import BookCard from './BookCard';
import SubjectFilter from './SubjectFilter';

interface BooksGridProps {
  books: Book[];
}

const BooksGrid = ({ books }: BooksGridProps) => {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Generate subject filters
  const subjectFilters = useMemo(() => {
    const subjectCounts = books.reduce((acc, book) => {
      acc[book.subject] = (acc[book.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(subjectCounts).map(([subject, count]) => ({
      label: subject,
      value: subject,
      count,
    }));
  }, [books]);

  // Filter books by selected subject
  const filteredBooks = useMemo(() => {
    if (!selectedSubject) return books;
    return books.filter((book) => book.subject === selectedSubject);
  }, [books, selectedSubject]);

  const handleBookSelect = (bookId: string | null) => {
    // If we click on a different book while one is open,
    // close the current one first then open the new one
    if (selectedBookId && bookId && selectedBookId !== bookId) {
      setSelectedBookId(null);
      setTimeout(() => setSelectedBookId(bookId), 300);
    } else {
      setSelectedBookId(bookId);
    }
  };

  return (
    <div>
      <SubjectFilter
        subjects={subjectFilters}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
      />
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {filteredBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onSelect={handleBookSelect}
            isSelected={selectedBookId === book.id}
          />
        ))}
      </div>
    </div>
  );
};

export default BooksGrid;