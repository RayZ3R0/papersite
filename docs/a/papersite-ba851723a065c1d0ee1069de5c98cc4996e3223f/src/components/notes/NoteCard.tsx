'use client';

import { Resource } from '@/types/note';
import Image from 'next/image';
import { FileTextIcon } from '@/components/layout/icons';

interface NoteCardProps {
  resource: Resource;
  unitName?: string;
  topicName?: string;
}

export default function NoteCard({ resource, unitName, topicName }: NoteCardProps) {
  return (
    <div className="h-full bg-surface rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <a 
        href={resource.downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {/* Preview Image or Default Icon */}
        <div className="relative aspect-[4/3] w-full bg-surface-alt">
          {resource.previewImage ? (
            <Image
              src={resource.previewImage}
              alt={resource.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FileTextIcon className="w-12 h-12 text-text-muted" />
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                Download PDF
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-medium text-lg mb-1 line-clamp-2">
            {resource.title}
          </h3>
          
          {/* Unit and Topic info if provided */}
          {(unitName || topicName) && (
            <div className="text-sm text-text-muted">
              {unitName && <span>{unitName}</span>}
              {unitName && topicName && <span> • </span>}
              {topicName && <span>{topicName}</span>}
            </div>
          )}
          
          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {resource.tags.map((tag: string) => (
                <span 
                  key={tag}
                  className="inline-block px-2 py-0.5 text-xs bg-surface-alt rounded-full text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </a>
    </div>
  );
}