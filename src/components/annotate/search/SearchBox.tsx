'use client';

interface SearchBoxProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function SearchBox({ placeholder = 'Search papers...', onSearch }: SearchBoxProps) {
  return (
    <div className="relative">
      <input
        type="search"
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onChange={(e) => onSearch?.(e.target.value)}
      />
    </div>
  );
}