'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Book } from '@/types/book';

interface SideTrayProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}

export default function SideTray({ book, isOpen, onClose }: SideTrayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Use appropriate image and download URLs
  const imageSource = book.coverImage || book.imageUrl || '/books/book-placeholder.svg';
  const downloadUrl = book.downloadUrl || book.pdfUrl;

  return (
    <div className="absolute inset-0 z-40">
      <div
        ref={overlayRef}
        className={`
          absolute inset-0 bg-surface shadow-lg
          overflow-y-auto rounded-lg
          transform transition-all duration-300 ease-in-out
          scale-[0.85] sm:scale-100
        `}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-text-muted hover:text-text p-1"
        >
          ✕
        </button>

        {/* Desktop version */}
        <div className="hidden sm:block p-4 space-y-4">
          <div className="relative w-36 h-48 mx-auto">
            <Image
              src={imageSource}
              alt={book.title}
              fill
              className="object-cover rounded"
              sizes="144px"
            />
          </div>

          <div className="text-center">
            <h2 className="text-lg font-semibold mb-1">{book.title}</h2>
            {book.subject && (
              <p className="text-sm text-text-muted">{book.subject}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {downloadUrl && (
              <a
                href={downloadUrl}
                className="block w-full px-3 py-2 text-center bg-primary text-white rounded hover:bg-primary/90"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download PDF
              </a>
            )}
            {book.solutionUrl && (
              <a
                href={book.solutionUrl}
                className="block w-full px-3 py-2 text-center bg-surface-alt text-text rounded hover:bg-surface-alt/90"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Solutions
              </a>
            )}
          </div>
        </div>

        {/* Mobile version - Simplified with more top padding */}
        <div className="block sm:hidden px-3 pt-12 pb-3 space-y-2">
          <h3 className="text-sm font-medium text-center mb-3">{book.title}</h3>
          <div className="flex flex-col gap-2">
            {downloadUrl && (
              <a
                href={downloadUrl}
                className="block w-full px-3 py-1.5 text-center text-sm bg-primary text-white rounded hover:bg-primary/90"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download PDF
              </a>
            )}
            {book.solutionUrl && (
              <a
                href={book.solutionUrl}
                className="block w-full px-3 py-1.5 text-center text-sm bg-surface-alt text-text rounded hover:bg-surface-alt/90"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Solutions
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}