'use client';

import * as React from 'react';

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
  const handleClick = React.useCallback((item: FilterItem) => {
    if (item.isSelected) {
      onDeselect(item.id);
    } else {
      onSelect(item.id);
    }
  }, [onSelect, onDeselect]);

  return (
    <div className={className}>
      <h3 className="text-xs font-medium text-gray-500 mb-2 px-4 md:px-2">{title}</h3>

      {/* Main container with padding to protect focus rings */}
      <div className="relative px-4 md:px-2">
        {/* Hidden overflow container */}
        <div className="-mx-4 md:-mx-2">
          {/* Scroll container with inner padding */}
          <div 
            className="flex md:flex-wrap gap-2 overflow-x-auto px-4 md:px-2 py-1
              scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
            role="group"
            aria-label={`${title} filters`}
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className={`flex items-center shrink-0 gap-1.5 px-3 py-1.5 rounded-full text-sm 
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${item.isSelected 
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-400' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 focus:ring-gray-400'}`}
                type="button"
                role="checkbox"
                aria-checked={item.isSelected}
                aria-label={`Filter by ${item.name}`}
              >
                {/* Item Name */}
                <span className="truncate max-w-[150px]">{item.name}</span>

                {/* Paper Count Badge */}
                {typeof item.count !== 'undefined' && (
                  <span 
                    className={`inline-flex items-center justify-center min-w-[20px] px-1.5 
                      text-xs rounded-full ${item.isSelected 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-700'}`}
                    aria-label={`${item.count} papers available`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* No Items Message */}
      {items.length === 0 && (
        <p className="text-sm text-gray-400 italic px-4 md:px-2">No items available</p>
      )}
    </div>
  );
};

export default FilterBox;