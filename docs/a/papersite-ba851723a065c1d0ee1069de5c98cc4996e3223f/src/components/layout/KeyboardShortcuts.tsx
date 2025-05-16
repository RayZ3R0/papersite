import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const SHORTCUTS = [
  { key: '/', description: 'Focus search' },
  { key: 'g p', description: 'Go to papers' },
  { key: 'g s', description: 'Go to subjects' },
  { key: 'Esc', description: 'Clear search' },
  { key: '↑/↓', description: 'Navigate results' }
];

interface Props {
  onSearchFocus?: () => void;
  onSearchClear?: () => void;
}

export default function KeyboardShortcuts({ onSearchFocus, onSearchClear }: Props) {
  const router = useRouter();
  const keysPressed = useRef(new Set<string>());
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    keysPressed.current.add(e.key.toLowerCase());

    // Search focus ('/')
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      onSearchFocus?.();
    }

    // Clear search (Escape)
    if (e.key === 'Escape') {
      onSearchClear?.();
    }

    // Show keyboard shortcuts (?)
    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setShowHelp(true);
    }

    // Navigation shortcuts
    if (keysPressed.current.has('g')) {
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        router.push('/subjects');
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        router.push('/subjects');
      }
    }
  }, [router, onSearchFocus, onSearchClear]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.key.toLowerCase());
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <>
      {/* Keyboard Shortcuts Help Modal */}
      {showHelp && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowHelp(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h2>
            <div className="space-y-2">
              {SHORTCUTS.map(({ key, description }) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-gray-600">{description}</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500 text-center">
              Press ? to show/hide shortcuts
            </p>
          </div>
        </div>
      )}
    </>
  );
}