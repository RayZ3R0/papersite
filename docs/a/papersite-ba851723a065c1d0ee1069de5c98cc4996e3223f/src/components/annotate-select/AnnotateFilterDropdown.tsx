'use client';

import { useState, useRef, useEffect } from 'react';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface AnnotateFilterDropdownProps {
  title: string;
  options: FilterOption[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
}

export default function AnnotateFilterDropdown({
  title,
  options,
  selectedId,
  onChange,
  placeholder = 'Select...'
}: AnnotateFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle selection
  const handleSelect = (optionId: string) => {
    onChange(optionId === selectedId ? null : optionId);
    setIsOpen(false);
  };

  // Get selected option label
  const selectedOption = options.find(opt => opt.id === selectedId);

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-text-muted mb-1.5">
        {title}
      </label>
      
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left rounded-lg border
          transition-colors flex items-center justify-between
          ${isOpen 
            ? 'border-primary bg-primary/5' 
            : 'border-border bg-surface hover:border-border-hover'
          }`}
      >
        <span className={selectedId ? 'text-text' : 'text-text-muted'}>
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 py-1 bg-surface rounded-lg 
          border border-border shadow-lg max-h-60 overflow-auto">
          {options.map(option => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`w-full px-3 py-2 text-left text-sm flex items-center 
                justify-between group hover:bg-surface-alt transition-colors
                ${selectedId === option.id 
                  ? 'text-primary bg-primary/5' 
                  : 'text-text'
                }`}
            >
              <span>{option.label}</span>
              {option.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs
                  ${selectedId === option.id
                    ? 'bg-primary/10'
                    : 'bg-surface-alt group-hover:bg-surface-alt/70'
                  }`}
                >
                  {option.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Clear button */}
      {selectedId && (
        <button
          onClick={() => onChange(null)}
          className="absolute right-10 top-[34px] p-1 text-text-muted 
            hover:text-text rounded-full hover:bg-surface-alt transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}