'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import subjectsData from '@/lib/data/subjects.json';
import type { Subject, SubjectsData } from '@/types/subject';

export default function SubjectPage() {
  const params = useParams();
  const subjectId = params.subject as string;
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  
  // Get subject data
  const subject = (subjectsData as SubjectsData).subjects[subjectId];

  if (!subject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Subject not found</p>
      </div>
    );
  }

  // Get papers for the selected unit
  const getUnitPapers = (unitId: string) => {
    return subject.papers.filter(paper => paper.unitId === unitId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Subject Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold capitalize mb-2">{subject.name}</h1>
        <p className="text-gray-600">
          {subject.units.length} units available • Select a unit to view papers
        </p>
      </header>

      {/* Vertical layout */}
      <div className="space-y-6">
        {subject.units.map((unit) => {
          const unitPapers = getUnitPapers(unit.id);
          const isSelected = selectedUnit === unit.id;
          
          return (
            <div
              key={unit.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Unit Header */}
              <button
                onClick={() => {
                  setSelectedUnit(isSelected ? null : unit.id);
                }}
                className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <h2 className="text-lg font-semibold flex items-center justify-between">
                  {unit.name}
                  <span className="text-sm text-gray-500">
                    {unitPapers.length} papers
                  </span>
                </h2>
                {unit.description && (
                  <p className="text-sm text-gray-600 mt-1">{unit.description}</p>
                )}
              </button>

              {/* Papers List - Only show if selected and has papers */}
              {isSelected && unitPapers.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {unitPapers.map((paper) => (
                    <div
                      key={paper.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium">
                          {paper.session} {paper.year}
                        </h3>
                      </div>
                      
                      {/* Paper and Marking Scheme */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <a
                          href={paper.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Question Paper
                        </a>
                        <a
                          href={paper.markingSchemeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          Marking Scheme
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No papers message */}
              {isSelected && unitPapers.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No papers available for this unit
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}