export interface Subject {
  id: string;
  name: string;
  unitCount: number;  // Changed from 'units' to avoid conflict
  icon?: string;
}

export interface Paper {
  id: string;
  title: string;
  subject: string;
  unit: string;
  year: number;
  season: string;
  pdfUrl: string;
  thumbnailUrl?: string;
}

export interface Unit {
  id: string;
  name: string;
  papers: Paper[];
}

export interface SubjectDetails extends Subject {
  units: Unit[];
}

// Navigation
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SidebarNavItem extends NavItem {
  items?: NavItem[];
}

// Props
export interface LayoutProps {
  children: React.ReactNode;
}

export interface SearchProps {
  onSearch: (query: string) => void;
  onFilterChange?: (filters: FilterState) => void;
  placeholder?: string;
}

// State
export interface FilterState {
  subjects: string[];
  years: number[];
  seasons: string[];
}

export interface SearchState extends FilterState {
  query: string;
}