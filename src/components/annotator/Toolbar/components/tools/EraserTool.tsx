import React from 'react';
import { AbstractTool, ToolButton, ToolPreviewContainer } from './BaseTool';
import { PreviewProps, ToolRenderProps, ToolSettings } from '../../types/tools';

export class EraserTool extends AbstractTool {
  constructor() {
    super(
      'eraser',
      'Eraser',
      EraserIcon,
      'E'
    );
  }

  settings: ToolSettings[] = [
    {
      id: 'size',
      type: 'size',
      label: 'Eraser Size',
      value: 8,
      min: 1,
      max: 20
    }
  ];

  getPreview({ size }: PreviewProps): React.ReactNode {
    const previewSize = Math.min(16, size);
    
    return (
      <ToolPreviewContainer>
        <div className="relative">
          <div className="absolute w-3 h-3 rounded-sm bg-gray-400 dark:bg-gray-500 opacity-50" />
          <div 
            className="absolute rounded-full border-2 border-blue-500 dark:border-blue-400" 
            style={{ 
              width: `${previewSize}px`, 
              height: `${previewSize}px` 
            }} 
          />
        </div>
      </ToolPreviewContainer>
    );
  }

  render(props: ToolRenderProps): JSX.Element {
    return (
      <ToolButton
        {...props}
        icon={EraserIcon}
        name={this.name}
        shortcut={this.shortcut}
      />
    );
  }
}

function EraserIcon({ className = '' }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <path d="M20 20H7L3 16c-1.5-1.5-1.5-3.5 0-5l9-9c1.5-1.5 3.5-1.5 5 0l5 5c1.5 1.5 1.5 3.5 0 5l-7 7"></path>
      <path d="M8.5 16 15 9.5"></path>
    </svg>
  );
}

// Create a singleton instance
export const eraserTool = new EraserTool();