'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterItem {
  id: string;
  name: string;
  count?: number;
  isSelected?: boolean;
}

interface FilterBoxProps {
  items: FilterItem[];
  title: string;
  onSelect: (id: string) => void;
  onDeselect: (id: string) => void;
  multiSelect?: boolean;
  className?: string;
}

const FilterBox: React.FC<FilterBoxProps> = ({
  items,
  title,
  onSelect,
  onDeselect,
  multiSelect = false,
  className = ""
}) => {
  const [expanded, setExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsToShow, setItemsToShow] = useState<FilterItem[]>(items);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Update filtered items when the search term or items change
  useEffect(() => {
    if (!searchTerm) {
      setItemsToShow(items);
      return;
    }
    
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setItemsToShow(filtered);
  }, [items, searchTerm]);
  
  // Show selected items first
  const sortedItems = React.useMemo(() => {
    return [...itemsToShow].sort((a, b) => {
      // Selected items first
      if (a.isSelected && !b.isSelected) return -1;
      if (!a.isSelected && b.isSelected) return 1;
      // Then alphabetical
      return a.name.localeCompare(b.name);
    });
  }, [itemsToShow]);
  
  const handleClick = React.useCallback((item: FilterItem) => {
    if (item.isSelected) {
      onDeselect(item.id);
    } else {
      onSelect(item.id);
    }
  }, [onSelect, onDeselect]);
  
  const toggleExpand = () => {
    setExpanded(prev => !prev);
    // Focus search if expanding and has search input
    if (!expanded && items.length > 5 && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  };

  const selectedCount = items.filter(item => item.isSelected).length;
  const showSearch = items.length > 5;

  return (
    <div className={`rounded-lg bg-surface-alt border border-border ${className}`}>
      {/* Header - better touch target */}
      <button
        onClick={toggleExpand}
        className="w-full flex items-center justify-between p-3
                  text-text hover:text-text-muted transition-colors
                  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/30"
        aria-expanded={expanded}
        aria-controls={`filter-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-text">{title}</h3>
          {selectedCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
              {selectedCount} selected
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-text-muted transform transition-transform duration-200 
            ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={`filter-${title.toLowerCase().replace(/\s+/g, '-')}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden will-change-[opacity,height]"
          >
            <div className="px-3 pb-3 pt-0">
              {/* Search input for large lists */}
              {showSearch && (
                <div className="mb-2 mt-1">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filter..."
                      className="w-full px-3 py-1.5 text-sm
                        bg-surface border border-border 
                        rounded-md text-text
                        placeholder:text-text-muted/70
                        focus:outline-none focus:ring-1 focus:ring-primary/40
                        focus:border-primary/70 transition-colors"
                      style={{ WebkitAppearance: 'none', WebkitTapHighlightColor: 'transparent' }}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2
                                  w-5 h-5 flex items-center justify-center
                                  text-text-muted hover:text-text
                                  rounded-full hover:bg-surface-alt"
                        aria-label="Clear search"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" 
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
                             strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Horizontally scrollable on mobile, grid on desktop */}
              <div className="relative -mx-3">
                <div className={`
                  px-3 py-1 flex gap-2 overflow-x-auto md:grid md:grid-cols-2 md:gap-1.5
                  max-h-48 md:overflow-y-auto
                  scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent
                  ios-fix-overflow
                  ${showSearch ? '-mt-0.5' : ''}
                `}
                style={{
                  scrollbarWidth: 'thin', // Firefox
                  msOverflowStyle: 'auto', // IE and Edge
                  WebkitOverflowScrolling: 'touch', // iOS smooth scrolling
                }}
                >
                  {sortedItems.length > 0 ? sortedItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleClick(item)}
                      className={`
                        flex items-center justify-between whitespace-nowrap md:whitespace-normal
                        shrink-0 md:shrink px-3 py-1.5 rounded-full text-sm
                        transition-all active:scale-[0.98]
                        ${item.isSelected
                          ? 'bg-primary/10 text-primary hover:bg-primary/20'
                          : 'bg-surface text-text-muted hover:bg-surface-alt hover:text-text'}
                      `}
                      style={{ touchAction: 'manipulation' }}
                      role="checkbox"
                      aria-checked={item.isSelected}
                    >
                      <span className="truncate max-w-[150px]">{item.name}</span>
                      {typeof item.count !== "undefined" && (
                        <span
                          className={`ml-1.5 min-w-[20px] px-1.5 text-xs rounded-full ${
                            item.isSelected
                              ? "bg-primary/20"
                              : "bg-surface-alt text-text-muted"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  )) : (
                    <div className="text-center col-span-2 py-3 text-text-muted text-sm italic">
                      No matches found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterBox;