import React from 'react';
import { BaseTool, ToolRenderProps, PreviewProps, ToolType } from '../../types/tools';

export abstract class AbstractTool implements BaseTool {
  constructor(
    public readonly id: ToolType,
    public readonly name: string,
    public readonly icon: React.ComponentType<{ className?: string }>,
    public readonly shortcut?: string
  ) {}

  abstract getPreview(props: PreviewProps): React.ReactNode;
  abstract render(props: ToolRenderProps): JSX.Element;
}

interface ToolButtonProps extends ToolRenderProps {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  shortcut?: string;
}

export function ToolButton({
  icon: Icon,
  name,
  shortcut,
  isActive,
  onSelect
}: ToolButtonProps) {
  return (
    <button
      onClick={onSelect}
      className={`relative flex flex-col items-center justify-center py-2.5 px-2 rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95'
        }`}
    >
      <Icon className="w-5 h-5 mb-1.5" />
      <span className="text-xs font-medium capitalize">
        {name}
      </span>
      
      {/* Keyboard shortcut indicator */}
      {shortcut && (
        <div className="absolute top-1.5 right-1.5 flex items-center justify-center">
          <kbd className="text-[9px] font-mono px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 
            text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
            {shortcut}
          </kbd>
        </div>
      )}
    </button>
  );
}

export function ToolPreviewContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
      {children}
    </div>
  );
}