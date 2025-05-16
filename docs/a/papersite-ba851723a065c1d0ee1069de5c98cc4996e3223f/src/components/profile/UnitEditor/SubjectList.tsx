'use client';

import { useState } from 'react';
import { UserSubjectConfig } from '@/types/profile';
import SubjectCard from './SubjectCard';
import { registrationSubjects } from '@/components/auth/registration/subjectData';

interface SubjectListProps {
  subjects: UserSubjectConfig[];
  onSubjectUpdate: (updatedSubject: UserSubjectConfig) => void;
}

export default function SubjectList({
  subjects,
  onSubjectUpdate
}: SubjectListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories from registration subjects
  const categories = Array.from(
    new Set(Object.values(registrationSubjects).map(subject => subject.category))
  );

  // Filter subjects based on search and category
  const filteredSubjects = subjects.filter(subject => {
    const regSubject = registrationSubjects[subject.subjectCode];
    if (!regSubject) return false;

    const matchesSearch = searchQuery === '' || 
      regSubject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.subjectCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || regSubject.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full px-4 py-2 rounded-lg text-base
              bg-surface border-2 transition duration-200 outline-none
              border-border hover:border-primary/50 focus:border-primary
              placeholder:text-text-muted/60
            "
          />
        </div>

        <div className="flex-shrink-0">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="
              px-4 py-2 rounded-lg text-base
              bg-surface border-2 transition duration-200 outline-none
              border-border hover:border-primary/50 focus:border-primary
              text-text
            "
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredSubjects.map(subject => (
          <SubjectCard
            key={subject.subjectCode}
            subject={subject}
            onUpdate={onSubjectUpdate}
          />
        ))}
        {filteredSubjects.length === 0 && (
          <div className="text-center p-8 text-text-muted bg-surface rounded-lg">
            {subjects.length === 0 
              ? 'No subjects selected yet'
              : 'No subjects match your search criteria'
            }
          </div>
        )}
      </div>
    </div>
  );
}
