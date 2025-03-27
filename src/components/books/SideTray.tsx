'use client';

import { Book } from '@/types/book';

interface SideTrayProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}

const SideTray = ({ book, isOpen, onClose }: SideTrayProps) => {
  return (
    <div
      className={`absolute right-0 top-0 h-full w-48 bg-surface border-l border-border
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        shadow-lg`}
    >
      <div className="p-4 flex flex-col gap-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-text hover:text-text-muted"
          aria-label="Close side tray"
        >
          
        </button>
        
        <a
          href={book.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90
            transition-colors text-center"
        >
          View Book
        </a>
        
        {book.solutionUrl && (
          <a
            href={book.solutionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-2 bg-secondary text-white rounded 
              hover:bg-secondary/90 transition-colors text-center"
          >
            View Solutions
          </a>
        )}
      </div>
    </div>
  );
};

export default SideTray;