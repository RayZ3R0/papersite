"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface DropdownOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder: string;
  emptyMessage?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder,
  emptyMessage = "No options available",
  icon,
  isLoading = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filter options based on search query
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (option.description && option.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get selected option for display
  const selectedOption = value ? options.find(option => option.value === value) : null;

  const handleSelectOption = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery("");
    } else if (e.key === "Enter" && isOpen && filteredOptions.length > 0) {
      handleSelectOption(filteredOptions[0].value);
    } else if (e.key === "ArrowDown" && isOpen && filteredOptions.length > 0) {
      e.preventDefault();
      const optionElements = document.querySelectorAll('[role="option"]');
      if (optionElements.length > 0) {
        (optionElements[0] as HTMLElement).focus();
      }
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2.5 bg-surface 
          border border-border rounded-md text-left transition-colors
          ${isOpen ? 'ring-2 ring-primary/20 border-primary/40' : 'hover:border-border/80'}
          ${isLoading ? 'opacity-75 cursor-wait' : ''}`}
        disabled={isLoading}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="flex-shrink-0 text-primary">{icon}</span>}
          
          {selectedOption ? (
            <span className="truncate text-text">{selectedOption.label}</span>
          ) : (
            <span className="text-text-muted">{placeholder}</span>
          )}
        </div>
        
        {isLoading ? (
          <svg className="animate-spin h-4 w-4 text-text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <ChevronDownIcon 
            className={`h-4 w-4 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div 
          className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-md shadow-lg overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Search input */}
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className="w-full p-2 bg-surface-alt border border-border rounded-md
                text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Options list */}
          <ul 
            className="max-h-60 overflow-y-auto thin-scrollbar"
            role="listbox"
            aria-label={placeholder}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  tabIndex={0}
                  onClick={() => handleSelectOption(option.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectOption(option.value);
                    }
                  }}
                  className={`p-2.5 cursor-pointer focus:outline-none focus:bg-primary/5
                    ${value === option.value 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-text hover:bg-surface-alt'
                    }`}
                >
                  <div className="truncate">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-text-muted truncate mt-0.5">{option.description}</div>
                  )}
                </li>
              ))
            ) : (
              <li className="p-4 text-sm text-text-muted text-center">{emptyMessage}</li>
            )}
          </ul>
        </div>
      )}

      <style jsx global>{`
        .thin-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .thin-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .thin-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 4px;
        }
        .animate-in {
          animation-duration: 150ms;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fadeIn;
        }
        .slide-in-from-top-2 {
          animation-name: slideInFromTop;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInFromTop {
          from { transform: translateY(-8px); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}