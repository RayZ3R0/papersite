import React from 'react';

interface SaveDialogProps {
  progress: number;
  onCancel: () => void;
}

export default function SaveDialog({ progress, onCancel }: SaveDialogProps) {
  // Format progress as percentage
  const progressPercent = Math.round(progress * 100);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 max-w-md w-full rounded-lg shadow-xl">
        <h3 className="text-lg font-medium mb-4">Saving Annotated PDF</h3>
        
        <div className="mb-4">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-right mt-1 text-sm text-gray-600">
            {progressPercent}%
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Please wait while we process your annotations and create the PDF...
        </p>
        
        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}