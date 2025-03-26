'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Subject, Unit, Paper } from '@/types';
import { getSubject, getUnitPapers, getUnit } from '@/lib/data/subjectUtils';

export default function SubjectPage() {
  const params = useParams();
  const subjectId = params.subject as string;
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [papers, setPapers] = useState<{ [key: string]: Paper[] }>({});

  useEffect(() => {
    const subjectData = getSubject(subjectId);
    setSubject(subjectData);
  }, [subjectId]);

  useEffect(() => {
    if (selectedUnit) {
      const unitPapers = getUnitPapers(subjectId, selectedUnit);
      setPapers(prev => ({
        ...prev,
        [selectedUnit]: unitPapers
      }));
    }
  }, [selectedUnit, subjectId]);

  if (!subject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading subject...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Subject Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold capitalize mb-2">{subject.name}</h1>
        <p className="text-gray-600">
          {subject.units.length} units available • Select a unit to view papers
        </p>
      </header>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subject.units.map((unit) => (
          <div
            key={unit.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* Unit Header */}
            <button
              onClick={() => setSelectedUnit(selectedUnit === unit.id ? null : unit.id)}
              className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <h2 className="text-lg font-semibold flex items-center justify-between">
                {unit.name}
                <span className="text-sm text-gray-500">
                  {papers[unit.id]?.length || 0} papers
                </span>
              </h2>
              {unit.description && (
                <p className="text-sm text-gray-600 mt-1">{unit.description}</p>
              )}
            </button>

            {/* Papers List - Expandable on mobile */}
            {selectedUnit === unit.id && papers[unit.id] && (
              <div className="divide-y divide-gray-100">
                {papers[unit.id].map((paper) => (
                  <div
                    key={paper.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium">
                        {paper.session} {paper.year}
                      </h3>
                    </div>
                    
                    {/* Paper and Marking Scheme - Side by side on desktop, stacked on mobile */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Question Paper */}
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <span className="mr-2">
                          {/* You can add an icon here */}
                        </span>
                        Question Paper
                      </a>

                      {/* Marking Scheme */}
                      <a
                        href={paper.markingSchemeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <span className="mr-2">
                          {/* You can add an icon here */}
                        </span>
                        Marking Scheme
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Quick Actions */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-2 md:hidden">
        {/* Search Button */}
        <button
          onClick={() => {/* Add search handler */}}
          className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
          aria-label="Search Papers"
        >
          {/* Add search icon */}
        </button>
      </div>
    </div>
  );
}