import { useState, useEffect } from "react";
import { UserSubjectConfig } from "@/types/registration";
import { SubjectSelector } from "./SubjectSelector";
import { LoadingButton } from "@/components/ui/LoadingButton";

interface EditSubjectsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: UserSubjectConfig[];
  onUpdateSubjects: (subjects: UserSubjectConfig[]) => Promise<void>;
  isUpdating?: boolean;
}

export function EditSubjectsDialog({
  isOpen,
  onClose,
  subjects: initialSubjects,
  onUpdateSubjects,
  isUpdating = false
}: EditSubjectsDialogProps) {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Reset state when dialog opens with new initial subjects
    if (isOpen) {
      setSubjects(initialSubjects);
      setHasChanges(false);
    }
  }, [isOpen, initialSubjects]);

  if (!isOpen) return null;

  const handleUpdateSubjects = (newSubjects: UserSubjectConfig[]) => {
    setSubjects(newSubjects);
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onUpdateSubjects(subjects);
    setHasChanges(false);
    onClose();
  };

  const handleClose = () => {
    setSubjects(initialSubjects);
    setHasChanges(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4 z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subjects-dialog-title"
      >
        <div className="w-full max-w-4xl bg-card rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 id="subjects-dialog-title" className="text-lg font-medium">
              Edit Subjects & Units
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-text-muted hover:text-text rounded-lg transition-colors"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
            <SubjectSelector
              subjects={subjects}
              onUpdateSubjects={handleUpdateSubjects}
            />
          </div>

          <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-surface">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors"
            >
              Cancel
            </button>
            <LoadingButton
              onClick={handleSave}
              loading={isUpdating}
              disabled={!hasChanges}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:bg-primary/50 rounded-lg transition-colors"
            >
              Save Changes
            </LoadingButton>
          </div>
        </div>
      </div>
    </>
  );
}
