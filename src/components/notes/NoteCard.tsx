'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Resource } from '@/types/note';
import { FolderIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import FolderModal from './FolderModal';
import PDFViewer from './PDFViewer';

interface NoteCardProps {
  resource: Resource;
  unitName?: string;
  topicName?: string;
}

export default function NoteCard({ resource, unitName, topicName }: NoteCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const isFolder = resource.type === 'folder';
  const isPDF = resource.type === 'pdf';
  const itemCount = resource.items?.length || 0;

  // Check if device is desktop
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };
    
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  const handleCardClick = () => {
    if (isFolder) {
      setIsModalOpen(true);
    } else if (isPDF) {
      // Use PDF viewer only on desktop, otherwise open in new tab
      if (isDesktop) {
        setIsPDFViewerOpen(true);
      } else {
        window.open(resource.downloadUrl, '_blank');
      }
    } else {
      window.open(resource.downloadUrl, '_blank');
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="relative h-full bg-surface rounded-lg overflow-hidden shadow-sm border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer group"
      >
        {/* Preview Image or Icon */}
        <div className="aspect-[3/2] relative bg-surface-alt flex items-center justify-center">
          {resource.previewImage ? (
            <Image
              src={resource.previewImage}
              alt={resource.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="text-text-muted">
              {isFolder ? (
                <FolderIcon className="h-16 w-16" />
              ) : (
                <DocumentTextIcon className="h-16 w-16" />
              )}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-3">
          <h3 className="font-medium text-text truncate group-hover:text-primary transition-colors">
            {resource.title}
          </h3>
          
          <div className="mt-1 text-xs text-text-muted">
            {unitName && <span className="block truncate">Unit: {unitName}</span>}
            {topicName && <span className="block truncate">Topic: {topicName}</span>}
            {isFolder && <span className="block mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>}
          </div>
        </div>

        {/* Type Badge */}
        <div className="absolute top-2 right-2 bg-surface px-2 py-1 rounded text-xs font-medium text-text-muted">
          {isFolder ? 'Folder' : 'PDF'}
        </div>
      </div>

      {/* Folder Modal */}
      {isFolder && (
        <FolderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          folder={resource}
          unitName={unitName}
          topicName={topicName}
        />
      )}

      {/* PDF Viewer - Only on desktop */}
      {isPDF && isDesktop && (
        <PDFViewer
          isOpen={isPDFViewerOpen}
          onClose={() => setIsPDFViewerOpen(false)}
          resource={resource}
          unitName={unitName}
          topicName={topicName}
        />
      )}
    </>
  );
}