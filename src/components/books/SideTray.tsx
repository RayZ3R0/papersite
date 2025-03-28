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
    <div className="fixed inset-0 bg-black/50 z-40">
      <div
        ref={overlayRef}
        className={`
          fixed top-0 bottom-0 bg-surface p-6 shadow-xl 
          transform transition-transform duration-300 ease-in-out
          w-[80%] left-[10%] md:w-1/2 md:left-auto md:right-0
          overflow-y-auto
        `}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text"
        >
          ✕
        </button>

        <div className="mt-8 space-y-6">
          <div className="relative w-48 h-64 mx-auto">
            <Image
              src={imageSource}
              alt={book.title}
              fill
              className="object-cover rounded"
              sizes="(max-width: 768px) 80vw, 192px"
            />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
            {book.subject && (
              <p className="text-text-muted mb-4">{book.subject}</p>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-text-muted">
              {book.description || 'No description available.'}
            </p>
          </div>

          {downloadUrl && (
            <div className="flex flex-col gap-4 pt-4">
              <a
                href={downloadUrl}
                className="block w-full px-4 py-2 text-center bg-primary text-white rounded hover:bg-primary/90"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download PDF
              </a>
              {book.solutionUrl && (
                <a
                  href={book.solutionUrl}
                  className="block w-full px-4 py-2 text-center bg-surface-alt text-text rounded hover:bg-surface-alt/90"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Solutions
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}