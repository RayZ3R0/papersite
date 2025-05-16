'use client';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface AnnotateFilterBoxProps {
  title: string;
  options: FilterOption[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
  allowDeselect?: boolean;
}

export default function AnnotateFilterBox({
  title,
  options,
  selectedId,
  onChange,
  allowDeselect = true,
}: AnnotateFilterBoxProps) {
  const handleClick = (id: string) => {
    if (allowDeselect && id === selectedId) {
      onChange(null);
    } else {
      onChange(id);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-text-muted mb-2">{title}</h3>
      <div className="space-y-1">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleClick(option.id)}
            className={`w-full px-3 py-2 text-sm rounded-md text-left transition-colors
              flex items-center justify-between group
              ${selectedId === option.id 
                ? 'bg-primary/10 text-primary' 
                : 'hover:bg-surface-alt text-text hover:text-text'
              }`}
          >
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span className={`text-xs rounded-full px-2 py-0.5
                ${selectedId === option.id
                  ? 'bg-primary/20'
                  : 'bg-surface-alt group-hover:bg-surface-alt/70'
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}