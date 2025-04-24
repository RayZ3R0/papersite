'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Book } from '@/types/book';
import SideTray from './SideTray';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const [isTrayOpen, setIsTrayOpen] = useState(false);

  // Use coverImage if available, otherwise fallback to imageUrl or placeholder
  const imageSource = 
    book.coverImage || 
    book.imageUrl || 
    '/books/book-placeholder.svg';

  return (
    <div className="relative group">
      <div 
        className="relative bg-surface rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden"
        onClick={() => setIsTrayOpen(true)}
        style={{ scrollbarWidth: 'none' }} // Firefox
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={imageSource}
            alt={book.title}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          
          {/* Hover overlay with info icon */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-lg flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent rounded-b-lg">
          <h3 className="font-medium text-lg text-white line-clamp-2">
            {book.title}
          </h3>
          {book.subject && (
            <p className="text-sm text-white/80 mt-1">
              {book.subject}
            </p>
          )}
        </div>
      </div>

      <SideTray
        book={book}
        isOpen={isTrayOpen}
        onClose={() => setIsTrayOpen(false)}
      />
    </div>
  );
}