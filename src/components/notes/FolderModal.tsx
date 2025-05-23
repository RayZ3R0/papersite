'use client';

import { useState, useEffect, Fragment, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Resource } from '@/types/note';
import NoteCard from './NoteCard';
import { 
  XMarkIcon, 
  MagnifyingGlassIcon,
  FolderIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  Squares2X2Icon,    // Grid view icon (correct name)
  ListBulletIcon
} from '@heroicons/react/24/outline';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: Resource;
  unitName?: string;
  topicName?: string;
}

export default function FolderModal({
  isOpen,
  onClose,
  folder,
  unitName,
  topicName
}: FolderModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Return early if there are no items
  if (!folder.items || folder.items.length === 0) {
    return null;
  }

  // Filter items based on search query
  const filteredItems = folder.items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort items: folders first, then files
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.title.localeCompare(b.title);
  });

  // Handle bulk download for selected items
  const handleBulkDownload = useCallback(() => {
    selectedItems.forEach(itemId => {
      const item = folder.items?.find(i => i.id === itemId);
      if (item && item.downloadUrl) {
        window.open(item.downloadUrl, '_blank');
      }
    });
    setSelectedItems(new Set());
  }, [selectedItems, folder.items]);

  // Clear search and selections when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedItems(new Set());
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        {/* Dialog container */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="flex min-h-full items-center justify-center p-0 md:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel 
                className="w-full max-w-7xl h-full md:h-auto md:max-h-[90vh] 
                  transform overflow-hidden bg-background 
                  text-left align-middle shadow-2xl transition-all
                  md:rounded-xl border border-border/50
                  flex flex-col"
                style={{
                  marginTop: 'calc(env(safe-area-inset-top, 0px) + 56px)',
                  marginBottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)',
                  maxHeight: 'calc(100vh - 120px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))'
                }}
              >
                {/* Modal Header - Fixed */}
                <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-sm">
                  <div className="flex items-center justify-between p-4 md:p-6">
                    <div className="flex-1 min-w-0">
                      <Dialog.Title
                        as="h2"
                        className="text-xl md:text-2xl font-bold text-text truncate"
                      >
                        {folder.title}
                      </Dialog.Title>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-text-muted">
                        <span>{sortedItems.length} item{sortedItems.length !== 1 ? 's' : ''}</span>
                        {unitName && (
                          <>
                            <span>•</span>
                            <span>Unit: {unitName}</span>
                          </>
                        )}
                        {topicName && (
                          <>
                            <span>•</span>
                            <span>Topic: {topicName}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      className="ml-4 rounded-lg p-2 text-text-muted hover:text-text 
                        hover:bg-surface-alt transition-colors"
                      onClick={onClose}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Search and Controls */}
                  <div className="px-4 md:px-6 pb-4 space-y-3">
                    {/* Search Bar */}
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                      <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg
                          text-text placeholder-text-muted focus:outline-none focus:ring-2 
                          focus:ring-primary/50 focus:border-primary"
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex rounded-lg border border-border overflow-hidden">
                          <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 transition-colors ${
                              viewMode === 'grid' 
                                ? 'bg-primary text-white' 
                                : 'bg-surface text-text-muted hover:text-text'
                            }`}
                          >
                            <Squares2X2Icon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 transition-colors ${
                              viewMode === 'list' 
                                ? 'bg-primary text-white' 
                                : 'bg-surface text-text-muted hover:text-text'
                            }`}
                          >
                            <ListBulletIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Bulk Actions */}
                      {selectedItems.size > 0 && (
                        <button
                          onClick={handleBulkDownload}
                          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white 
                            rounded-lg hover:opacity-90 transition-opacity text-sm"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                          Download {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 md:p-6">
                    {sortedItems.length === 0 ? (
                      <div className="text-center py-12">
                        <MagnifyingGlassIcon className="h-12 w-12 text-text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-text mb-2">No items found</h3>
                        <p className="text-text-muted">
                          {searchQuery ? 'Try adjusting your search terms' : 'This folder appears to be empty'}
                        </p>
                      </div>
                    ) : viewMode === 'grid' ? (
                      /* Grid View */
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {sortedItems.map(resource => (
                          <div key={resource.id} className="relative">
                            <NoteCard
                              resource={resource}
                              unitName={unitName}
                              topicName={topicName}
                            />
                            {/* Selection checkbox for bulk actions */}
                            {resource.downloadUrl && (
                              <div className="absolute top-2 left-2 z-10">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.has(resource.id)}
                                  onChange={(e) => {
                                    const newSelected = new Set(selectedItems);
                                    if (e.target.checked) {
                                      newSelected.add(resource.id);
                                    } else {
                                      newSelected.delete(resource.id);
                                    }
                                    setSelectedItems(newSelected);
                                  }}
                                  className="rounded border-border focus:ring-primary"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* List View */
                      <div className="space-y-2">
                        {sortedItems.map(resource => (
                          <div key={resource.id} 
                            className="flex items-center gap-3 p-3 bg-surface rounded-lg 
                              border border-border hover:border-primary transition-colors group">
                            {/* Selection checkbox */}
                            {resource.downloadUrl && (
                              <input
                                type="checkbox"
                                checked={selectedItems.has(resource.id)}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedItems);
                                  if (e.target.checked) {
                                    newSelected.add(resource.id);
                                  } else {
                                    newSelected.delete(resource.id);
                                  }
                                  setSelectedItems(newSelected);
                                }}
                                className="rounded border-border focus:ring-primary"
                              />
                            )}
                            
                            {/* Icon */}
                            <div className="flex-shrink-0">
                              {resource.type === 'folder' ? (
                                <FolderIcon className="h-8 w-8 text-text-muted" />
                              ) : (
                                <DocumentTextIcon className="h-8 w-8 text-text-muted" />
                              )}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-text group-hover:text-primary 
                                transition-colors truncate">
                                {resource.title}
                              </h3>
                              <p className="text-sm text-text-muted">
                                {resource.type === 'folder' ? 'Folder' : 'PDF Document'}
                              </p>
                            </div>
                            
                            {/* Download button */}
                            {resource.downloadUrl && (
                              <button
                                onClick={() => window.open(resource.downloadUrl, '_blank')}
                                className="flex-shrink-0 p-2 text-text-muted hover:text-primary 
                                  transition-colors"
                              >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}