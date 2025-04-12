'use client';

import { useParams } from 'next/navigation';

interface Paper {
  id: string;
  title: string;
  unit: string;
  year: number;
  season: string;
  pdfUrl: string;
}

// Mock data - replace with actual data
const mockPapers: Record<string, Paper[]> = {
  physics: [
    {
      id: 'phys1',
      title: 'Physics Unit 1 2024',
      unit: 'Unit 1',
      year: 2024,
      season: 'Summer',
      pdfUrl: '/papers/physics/2024-u1.pdf'
    },
    // Add more mock papers
  ]
};

function PaperCard({ title, unit, year, season, pdfUrl }: Paper) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent">
      <div className="flex-1 space-y-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">
          {unit} • {season} {year}
        </p>
      </div>
      <a
        href={`/annotate/view?pdf=${encodeURIComponent(pdfUrl)}`}
        className="ml-4 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
      >
        Open
      </a>
    </div>
  );
}

function UnitSection({ unit, papers }: { unit: string; papers: Paper[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{unit}</h2>
      <div className="space-y-2">
        {papers.map((paper) => (
          <PaperCard key={paper.id} {...paper} />
        ))}
      </div>
    </div>
  );
}

export default function SubjectPage() {
  const params = useParams();
  const subject = params.subject as string;
  const papers = mockPapers[subject] || [];

  // Group papers by unit
  const papersByUnit = papers.reduce((acc, paper) => {
    if (!acc[paper.unit]) {
      acc[paper.unit] = [];
    }
    acc[paper.unit].push(paper);
    return acc;
  }, {} as Record<string, Paper[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight capitalize">
          {subject} Papers
        </h1>
      </div>
      <div className="space-y-8">
        {Object.entries(papersByUnit).map(([unit, papers]) => (
          <UnitSection key={unit} unit={unit} papers={papers} />
        ))}
      </div>
    </div>
  );
}