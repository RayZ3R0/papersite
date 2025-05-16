import { useEffect, useCallback } from 'react';
import { ToolType } from '../types';

interface UseShortcutsProps {
  onToolChange?: (tool: ToolType) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
  onSave?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isVisible?: boolean;
  setIsVisible?: (visible: boolean) => void;
}

interface Shortcuts {
  tools: {
    [K in ToolType]: string;
  };
  actions: {
    undo: string[];
    redo: string[];
    clear: string[];
    save: string[];
    toggle: string[];
  };
}

const shortcuts: Shortcuts = {
  tools: {
    pen: 'p',
    highlighter: 'h',
    eraser: 'e'
  },
  actions: {
    undo: ['z', 'Z'],
    redo: ['y', 'Y'],
    clear: ['Delete'],
    save: ['s', 'S'],
    toggle: ['Escape']
  }
};

export default function useShortcuts({
  onToolChange,
  onUndo,
  onRedo,
  onClear,
  onSave,
  canUndo = false,
  canRedo = false,
  isVisible = true,
  setIsVisible
}: UseShortcutsProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const { key, ctrlKey, metaKey, shiftKey } = e;
    const cmdKey = metaKey || ctrlKey;

    // Tool shortcuts (no modifiers)
    if (!cmdKey && !shiftKey) {
      // Change tools
      (Object.entries(shortcuts.tools) as [ToolType, string][]).forEach(([tool, shortcut]) => {
        if (key.toLowerCase() === shortcut) {
          onToolChange?.(tool);
          e.preventDefault();
        }
      });

      // Toggle visibility
      if (key === shortcuts.actions.toggle[0]) {
        setIsVisible?.(!isVisible);
        e.preventDefault();
      }
    }

    // Command shortcuts
    if (cmdKey) {
      // Undo/Redo
      if (shortcuts.actions.undo.includes(key)) {
        if (canUndo) {
          onUndo?.();
          e.preventDefault();
        }
      }

      if (shortcuts.actions.redo.includes(key)) {
        if (canRedo) {
          onRedo?.();
          e.preventDefault();
        }
      }

      // Save
      if (shortcuts.actions.save.includes(key)) {
        onSave?.();
        e.preventDefault();
      }

      // Clear
      if (shortcuts.actions.clear.includes(key)) {
        onClear?.();
        e.preventDefault();
      }
    }
  }, [
    onToolChange,
    onUndo,
    onRedo,
    onClear,
    onSave,
    canUndo,
    canRedo,
    isVisible,
    setIsVisible
  ]);

  // Add and remove keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcuts
  };
}

// Helper functions for formatting shortcut display text
function formatModifierKey(isMac: boolean): string {
  return isMac ? '⌘' : 'Ctrl';
}

function formatShortcut(shortcut: string, modifiers: string[] = []): string {
  const isMac = typeof window !== 'undefined' && navigator.platform.toLowerCase().includes('mac');
  return [...modifiers.map(m => formatModifierKey(isMac)), shortcut.toUpperCase()].join('+');
}

// Export keyboard shortcut display text
export const shortcutMap = {
  pen: formatShortcut('p'),
  highlighter: formatShortcut('h'),
  eraser: formatShortcut('e'),
  undo: formatShortcut('z', ['cmd']),
  redo: formatShortcut('y', ['cmd']),
  clear: formatShortcut('Delete', ['cmd']),
  save: formatShortcut('s', ['cmd']),
  toggle: 'Esc'
} as const;