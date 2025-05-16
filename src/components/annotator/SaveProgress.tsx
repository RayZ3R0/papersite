'use client';

interface SaveProgressProps {
  currentPage: number;
  totalPages: number;
  status: string;
  isVisible: boolean;
}

export default function SaveProgress({ currentPage, totalPages, status, isVisible }: SaveProgressProps) {
  const progress = (currentPage / totalPages) * 100;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="space-y-4">
          {/* Status text */}
          <div className="text-center">
            <h3 className="text-lg font-medium mb-1">Saving PDF</h3>
            <p className="text-sm text-text-muted">{status}</p>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-surface-alt rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress text */}
          <div className="text-sm text-center text-text-muted">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
}
