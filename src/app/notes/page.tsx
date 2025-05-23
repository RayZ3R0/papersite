'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NotesErrorBoundary } from '@/components/error/NotesErrorBoundary';
import { Subject, Unit, NotesData, Resource } from '@/types/note';
import rawNotesData from '@/lib/data/notes.json';
import NoteCard from '@/components/notes/NoteCard';
import { 
  MagnifyingGlassIcon, 
  ChevronDownIcon,
  XMarkIcon,
  BookOpenIcon,
  DocumentTextIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

// Type assertion for the imported JSON
const notesData = rawNotesData as NotesData;

// Native Ad Component
function NativeAdWidget({ 
  variant = 'default',
  className = '',
  style = {}
}: { 
  variant?: 'default' | 'sidebar' | 'grid';
  className?: string;
  style?: React.CSSProperties;
}) {
  useEffect(() => {
    // Load the ad script
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = '//pl26722926.profitableratecpm.com/9befc45ca1d704f1b3ac3e59fd44c8c8/invoke.js';
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div 
      className={`native-ad-container ${className}`}
      style={style}
    >
      {/* Small "Sponsored" label for transparency */}
      <div className="text-xs text-text-muted mb-2 opacity-60">
        Sponsored
      </div>
      <div id="container-9befc45ca1d704f1b3ac3e59fd44c8c8"></div>
    </div>
  );
}

export default function NotesPage() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);
  const isUrlUpdate = useRef(false);

  // Initialize state from URL parameters
  useEffect(() => {
    const subjectId = searchParams.get('subject');
    const unitId = searchParams.get('unit');
    const search = searchParams.get('search') || '';
    
    if (isUrlUpdate.current) {
      isUrlUpdate.current = false;
      return;
    }

    setSearchQuery(search);

    if (subjectId) {
      const subject = notesData.subjects.find(s => s.id === subjectId);
      if (subject) {
        setSelectedSubject(subject);
        
        if (unitId) {
          const unit = subject.units.find(u => u.id === unitId);
          setSelectedUnit(unit || null);
        } else {
          setSelectedUnit(null);
        }
      }
    } else if (!isInitialMount.current) {
      setSelectedSubject(null);
      setSelectedUnit(null);
    }
    
    isInitialMount.current = false;
  }, [searchParams]);

  // Get all resources for current selection
  const getAllResources = (): Resource[] => {
    if (!selectedSubject) return [];
    
    const resources: Resource[] = [];
    
    if (selectedUnit) {
      // Add unit PDF if exists
      if (selectedUnit.unitPdf) {
        resources.push(selectedUnit.unitPdf);
      }
      
      // Add all topic resources
      selectedUnit.topics?.forEach(topic => {
        topic.resources.forEach(resource => {
          resources.push(resource);
        });
      });
    } else {
      // Add subject-level resources
      if (selectedSubject.resources) {
        resources.push(...selectedSubject.resources);
      }
      
      // Add all unit resources
      selectedSubject.units.forEach(unit => {
        if (unit.unitPdf) {
          resources.push(unit.unitPdf);
        }
        unit.topics?.forEach(topic => {
          topic.resources.forEach(resource => {
            resources.push(resource);
          });
        });
      });
    }
    
    return resources;
  };

  // Filter and search resources
  const filteredResources = getAllResources()
    .filter(resource => 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Sort folders first, then files
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.title.localeCompare(b.title);
    });

  // Update URL and state - no scroll behavior
  const updateFilters = (subject: Subject | null, unit: Unit | null, search: string = searchQuery) => {
    setSelectedSubject(subject);
    setSelectedUnit(unit);
    setSearchQuery(search);
    
    // Close dropdowns
    setIsSubjectDropdownOpen(false);
    setIsUnitDropdownOpen(false);
    
    isUrlUpdate.current = true;
    
    const params = new URLSearchParams();
    if (subject) params.set('subject', subject.id);
    if (unit) params.set('unit', unit.id);
    if (search) params.set('search', search);
    
    // Use replace instead of push to avoid scroll behavior
    router.replace(`/notes${params.toString() ? '?' + params.toString() : ''}`, { 
      scroll: false 
    });
  };

  // Get resource metadata
  const getResourceMetadata = (resource: Resource) => {
    const unit = selectedSubject?.units.find(u =>
      u.unitPdf === resource || u.topics?.some(t =>
        t.resources.includes(resource)
      )
    );
    const topic = unit?.topics?.find(t =>
      t.resources.includes(resource)
    );
    
    return { unit: unit?.name, topic: topic?.name };
  };

  // Statistics
  const stats = {
    totalSubjects: notesData.subjects.length,
    totalUnits: selectedSubject ? selectedSubject.units.length : 0,
    totalResources: filteredResources.length,
    folders: filteredResources.filter(r => r.type === 'folder').length,
    files: filteredResources.filter(r => r.type === 'pdf').length
  };

  // Insert ad in grid at strategic positions
  const getResourcesWithAds = () => {
    if (filteredResources.length <= 6) return filteredResources;
    
    const resourcesWithAds = [...filteredResources];
    // Insert ad after 6th item for better visibility
    const adPosition = 6;
    resourcesWithAds.splice(adPosition, 0, {
      id: 'native-ad-1',
      type: 'ad' as any,
      title: 'Advertisement',
    } as any);
    
    return resourcesWithAds;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-[56px] md:top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="py-4 md:py-6">
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-text">Study Notes</h1>
              <p className="text-text-muted mt-1">
                Browse comprehensive study materials organized by subject and unit
              </p>
            </div>

            {/* Mobile Filters */}
            <div className="md:hidden space-y-3">
              {/* Subject Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                  className="w-full flex items-center justify-between p-3 bg-surface-alt border border-border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <BookOpenIcon className="h-4 w-4 text-text-muted" />
                    <span className="text-text">
                      {selectedSubject ? selectedSubject.name : 'Select Subject'}
                    </span>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-text-muted transition-transform ${
                    isSubjectDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {isSubjectDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto
                    scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    {notesData.subjects.map(subject => (
                      <button
                        key={subject.id}
                        onClick={() => updateFilters(subject, null)}
                        className={`w-full text-left p-3 hover:bg-surface-hover transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          selectedSubject?.id === subject.id ? 'bg-primary/10 text-primary' : 'text-text'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{subject.name}</span>
                          <span className="text-xs text-text-muted bg-surface-alt px-2 py-0.5 rounded-full">
                            {subject.units.length} units
                          </span>
                        </div>
                      </button>
                    ))}
                    
                    {/* Scroll indicator - shows when content is scrollable */}
                    {notesData.subjects.length > 6 && (
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-surface to-transparent pointer-events-none rounded-b-lg" />
                    )}
                  </div>
                )}
              </div>

              {/* Unit Dropdown */}
              {selectedSubject && (
                <div className="relative">
                  <button
                    onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 bg-surface-alt border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="h-4 w-4 text-text-muted" />
                      <span className="text-text">
                        {selectedUnit ? selectedUnit.name : 'All Units'}
                      </span>
                    </div>
                    <ChevronDownIcon className={`h-4 w-4 text-text-muted transition-transform ${
                      isUnitDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {isUnitDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto
                      scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                      <button
                        onClick={() => updateFilters(selectedSubject, null)}
                        className={`w-full text-left p-3 hover:bg-surface-hover transition-colors first:rounded-t-lg ${
                          !selectedUnit ? 'bg-secondary/10 text-secondary' : 'text-text'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">All Units</span>
                          <span className="text-xs text-text-muted bg-surface-alt px-2 py-0.5 rounded-full">
                            {getAllResources().length} resources
                          </span>
                        </div>
                      </button>
                      
                      {selectedSubject.units.map(unit => {
                        const unitResources = (unit.unitPdf ? 1 : 0) + 
                          (unit.topics?.reduce((acc, topic) => acc + topic.resources.length, 0) || 0);
                        
                        return (
                          <button
                            key={unit.id}
                            onClick={() => updateFilters(selectedSubject, unit)}
                            className={`w-full text-left p-3 hover:bg-surface-hover transition-colors last:rounded-b-lg ${
                              selectedUnit?.id === unit.id ? 'bg-secondary/10 text-secondary' : 'text-text'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{unit.name}</span>
                              <span className="text-xs text-text-muted bg-surface-alt px-2 py-0.5 rounded-full">
                                {unitResources} resources
                              </span>
                            </div>
                          </button>
                        );
                      })}
                      
                      {/* Scroll indicator - shows when content is scrollable */}
                      {selectedSubject.units.length > 5 && (
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-surface to-transparent pointer-events-none rounded-b-lg" />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Native Ad - Top of page */}
              {selectedSubject && (
                <NativeAdWidget 
                  variant="default"
                  className="bg-surface rounded-lg border border-border p-3"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop Only */}
          <div className="hidden md:block w-80 flex-shrink-0 space-y-6">
            {/* Search Bar */}
            <div className="bg-surface rounded-xl p-4 border border-border">
              <h3 className="font-semibold text-text mb-3">Search</h3>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => updateFilters(selectedSubject, selectedUnit, e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-surface-alt border border-border rounded-lg
                    text-text placeholder-text-muted focus:outline-none focus:ring-2 
                    focus:ring-primary/50 focus:border-primary transition-colors text-sm"
                />
              </div>
            </div>

            {/* Subjects */}
            <div className="bg-surface rounded-xl p-4 border border-border">
              <h3 className="font-semibold text-text mb-3">Subjects</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {notesData.subjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => updateFilters(subject, null)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedSubject?.id === subject.id
                        ? 'bg-primary text-white'
                        : 'hover:bg-surface-alt text-text'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{subject.name}</span>
                      <span className="text-xs opacity-70">
                        {subject.units.length} units
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Units */}
            {selectedSubject && (
              <div className="bg-surface rounded-xl p-4 border border-border">
                <h3 className="font-semibold text-text mb-3">Units</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => updateFilters(selectedSubject, null)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !selectedUnit
                        ? 'bg-secondary text-white'
                        : 'hover:bg-surface-alt text-text'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">All Units</span>
                      <span className="text-xs opacity-70">
                        {getAllResources().length} resources
                      </span>
                    </div>
                  </button>
                  
                  {selectedSubject.units.map(unit => {
                    const unitResources = (unit.unitPdf ? 1 : 0) + 
                      (unit.topics?.reduce((acc, topic) => acc + topic.resources.length, 0) || 0);
                    
                    return (
                      <button
                        key={unit.id}
                        onClick={() => updateFilters(selectedSubject, unit)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedUnit?.id === unit.id
                            ? 'bg-secondary text-white'
                            : 'hover:bg-surface-alt text-text'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{unit.name}</span>
                          <span className="text-xs opacity-70">
                            {unitResources} resources
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Statistics Card */}
            <div className="bg-surface rounded-xl p-4 border border-border">
              <h3 className="font-semibold text-text mb-3">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subjects</span>
                  <span className="text-text font-medium">{stats.totalSubjects}</span>
                </div>
                {selectedSubject && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Units</span>
                    <span className="text-text font-medium">{stats.totalUnits}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-muted">Resources</span>
                  <span className="text-text font-medium">{stats.totalResources}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Folders</span>
                  <span className="text-text font-medium">{stats.folders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Files</span>
                  <span className="text-text font-medium">{stats.files}</span>
                </div>
              </div>
            </div>

            {/* Sidebar Native Ad - Bottom placement for 4x1 widget */}
            <NativeAdWidget 
              variant="sidebar"
              className="bg-surface rounded-xl border border-border p-4"
              style={{ minHeight: '200px' }}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {!selectedSubject ? (
              /* Welcome State */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <BookOpenIcon className="h-16 w-16 text-text-muted mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-text mb-2">
                    Welcome to Study Notes
                  </h2>
                  <p className="text-text-muted mb-6">
                    Select a subject from the sidebar to browse organized study materials, 
                    notes, and resources for your courses.
                  </p>
                  <div className="text-sm text-text-muted">
                    <p>Available: {stats.totalSubjects} subjects with comprehensive materials</p>
                  </div>
                </div>
              </div>
            ) : filteredResources.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <MagnifyingGlassIcon className="h-16 w-16 text-text-muted mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-text mb-2">
                  {searchQuery ? 'No results found' : 'No resources available'}
                </h2>
                <p className="text-text-muted">
                  {searchQuery 
                    ? 'Try adjusting your search terms or browse different subjects'
                    : 'This section doesn\'t have any resources yet'
                  }
                </p>
              </div>
            ) : (
              /* Results */
              <NotesErrorBoundary>
                <div className="space-y-6">
                  {/* Results Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-text">
                        {selectedUnit ? selectedUnit.name : selectedSubject.name}
                      </h2>
                    </div>
                  </div>

                  {/* Resources Grid with integrated ads */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 
                    pb-[calc(64px+env(safe-area-inset-bottom,0px))] md:pb-0">
                    {getResourcesWithAds().map((item, index) => {
                      if ((item as any).type === 'ad') {
                        return (
                          <div key="native-ad-grid" className="col-span-1 sm:col-span-2 lg:col-span-1">
                            <NativeAdWidget 
                              variant="grid"
                              className="bg-surface rounded-xl border border-border p-4 h-full"
                              style={{ minHeight: '280px' }}
                            />
                          </div>
                        );
                      }
                      
                      const resource = item as Resource;
                      const metadata = getResourceMetadata(resource);
                      return (
                        <NoteCard
                          key={resource.id}
                          resource={resource}
                          unitName={metadata.unit}
                          topicName={metadata.topic}
                        />
                      );
                    })}
                  </div>
                </div>
              </NotesErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}