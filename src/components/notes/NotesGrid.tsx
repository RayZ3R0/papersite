'use client';

import { useEffect, useState } from 'react';
import { Resource, Subject, Unit } from '@/types/note';
import NoteCard from './NoteCard';

interface NotesGridProps {
  subject: Subject;
  selectedUnit: Unit | null;
}

export default function NotesGrid({ subject, selectedUnit }: NotesGridProps) {
  const [resources, setResources] = useState<Resource[]>([]);

  // Helper function to get all resources from a unit
  const getUnitResources = (unit: Unit): Resource[] => {
    const resources: Resource[] = [];
    
    // Add unit PDF if exists
    if (unit.unitPdf) {
      resources.push(unit.unitPdf);
    }
    
    // Add all topic resources
    unit.topics?.forEach(topic => {
      topic.resources.forEach(resource => {
        resources.push(resource);
      });
    });
    
    return resources;
  };

  // Get non-unit resources (if any)
  const getNonUnitResources = (): Resource[] => {
    return subject.resources || [];
  };

  // Effect to update resources when subject or unit changes
  useEffect(() => {
    let newResources: Resource[] = [];
    
    if (selectedUnit) {
      // If unit is selected, only show resources from that unit
      newResources = getUnitResources(selectedUnit);
    } else {
      // If no unit selected, show all resources including non-unit ones
      newResources = [
        ...getNonUnitResources(),
        ...subject.units.flatMap(getUnitResources)
      ];
    }
    
    setResources(newResources);

    // Cleanup function
    return () => {
      setResources([]);
    };
  }, [subject.id, selectedUnit?.id]); 

  // If no resources, show message
  if (resources.length === 0) {
    return (
      <div className="text-center text-text-muted py-8">
        No notes available
      </div>
    );
  }

  // Split resources: unit PDF first, then remaining resources
  const unitPdf = selectedUnit?.unitPdf;
  const otherResources = resources.filter(r => r !== unitPdf);

  return (
    <div className="space-y-4">
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {unitPdf && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Unit PDF on the left */}
            <div className="col-span-2 h-full">
              <NoteCard
                resource={unitPdf}
                unitName={selectedUnit.name}
              />
            </div>

            {/* First two resources on the right */}
            <div className="space-y-4">
              {otherResources.slice(0, 2).map(resource => {
                const unit = subject.units.find(u =>
                  u.unitPdf === resource || u.topics?.some(t =>
                    t.resources.includes(resource)
                  )
                );
                const topic = unit?.topics?.find(t =>
                  t.resources.includes(resource)
                );

                return (
                  <div key={resource.id}>
                    <NoteCard
                      resource={resource}
                      unitName={unit?.name}
                      topicName={topic?.name}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Remaining resources in a grid */}
        <div className="grid grid-cols-3 gap-4">
          {otherResources.slice(unitPdf ? 2 : 0).map(resource => {
            const unit = subject.units.find(u =>
              u.unitPdf === resource || u.topics?.some(t =>
                t.resources.includes(resource)
              )
            );
            const topic = unit?.topics?.find(t =>
              t.resources.includes(resource)
            );

            return (
              <div key={resource.id}>
                <NoteCard
                  resource={resource}
                  unitName={unit?.name}
                  topicName={topic?.name}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Layout - Simple grid */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {resources.map(resource => {
          const unit = subject.units.find(u =>
            u.unitPdf === resource || u.topics?.some(t =>
              t.resources.includes(resource)
            )
          );
          const topic = unit?.topics?.find(t =>
            t.resources.includes(resource)
          );

          return (
            <div key={resource.id}>
              <NoteCard
                resource={resource}
                unitName={unit?.name}
                topicName={topic?.name}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}