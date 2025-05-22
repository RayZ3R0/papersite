import type { Paper } from '@/lib/api/papers';

interface PaperCardProps {
  paper: Paper;
  className?: string;
}

export default function PaperCard({ paper, className = '' }: PaperCardProps) {
  return (
    <div className={`p-4 hover:bg-surface-alt transition-colors ${className}`}>
      <h3 className="font-medium text-text mb-3">
        {paper.title}
      </h3>
      
      {/* Paper Info */}
      <div className="flex flex-wrap gap-2 mb-4 text-sm text-text-muted">
        <span>{paper.session} {paper.year}</span>
        <span>•</span>
        <span>Unit {paper.unit_code}</span>
        {paper.subject_name && (
          <>
            <span>•</span>
            <span>{paper.subject_name}</span>
          </>
        )}
      </div>
      
      {/* Download Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <a
          href={paper.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-3 
            bg-primary text-white rounded-lg hover:opacity-90 
            transition-colors shadow-sm hover:shadow"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          Question Paper
        </a>
        
        {paper.marking_scheme_url && (
          <a
            href={paper.marking_scheme_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-3 
              bg-secondary text-white rounded-lg hover:opacity-90 
              transition-colors shadow-sm hover:shadow"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
              />
            </svg>
            Marking Scheme
          </a>
        )}
      </div>
    </div>
  );
}