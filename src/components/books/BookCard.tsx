'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Book } from '@/types/book';
import SideTray from './SideTray';

interface BookCardProps {
  book: Book;
  onSelect: (id: string | null) => void;
  isSelected: boolean;
}

const BookCard = ({ book, onSelect, isSelected }: BookCardProps) => {
  const handleClick = () => {
    onSelect(isSelected ? null : book.id);
  };

  const handleClose = () => {
    onSelect(null);
  };

  return (
    <div 
      className={`relative bg-surface rounded-lg shadow-md overflow-hidden
        transform transition-all duration-300 hover:shadow-lg
        ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      <button
        onClick={handleClick}
        className="w-full text-left focus:outline-none focus:ring-2 
          focus:ring-primary rounded-lg"
      >
        <div className="relative h-48 w-full bg-surface-alt flex items-center justify-center">
          {book.imageUrl ? (
            <Image
              src={book.imageUrl}
              alt={book.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg
                className="w-12 h-12 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="text-text-muted text-sm">Book Cover</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-text line-clamp-2 mb-2">
            {book.title}
          </h3>
          <span className="inline-block px-2 py-1 rounded-md text-xs bg-surface-alt text-text-muted">
            {book.subject}
          </span>
        </div>
      </button>

      <SideTray 
        book={book} 
        isOpen={isSelected}
        onClose={handleClose}
      />
    </div>
  );
};

export default BookCard;