import React from 'react';
import { AbstractTool, ToolButton, ToolPreviewContainer } from './BaseTool';
import { PreviewProps, ToolRenderProps, ToolSettings } from '../../types/tools';

export class HighlighterTool extends AbstractTool {
  constructor() {
    super(
      'highlighter',
      'Highlighter',
      HighlighterIcon,
      'H'
    );
  }

  settings: ToolSettings[] = [
    {
      id: 'color',
      type: 'color',
      label: 'Color',
      value: '#ffeb3b'
    },
    {
      id: 'size',
      type: 'size',
      label: 'Stroke Size',
      value: 12,
      min: 1,
      max: 20
    },
    {
      id: 'opacity',
      type: 'opacity',
      label: 'Opacity',
      value: 0.3,
      min: 0.1,
      max: 0.5,
      step: 0.1
    }
  ];

  getPreview({ size, color, opacity = 0.3 }: PreviewProps): React.ReactNode {
    const previewSize = Math.min(16, size);
    const hexOpacity = Math.round(opacity * 255).toString(16).padStart(2, '0');
    
    return (
      <ToolPreviewContainer>
        <div 
          className="rounded-full" 
          style={{ 
            width: `${previewSize}px`, 
            height: `${previewSize}px`,
            backgroundColor: `${color}${hexOpacity}`
          }} 
        />
      </ToolPreviewContainer>
    );
  }

  render(props: ToolRenderProps): JSX.Element {
    return (
      <ToolButton
        {...props}
        icon={HighlighterIcon}
        name={this.name}
        shortcut={this.shortcut}
      />
    );
  }
}

function HighlighterIcon({ className = '' }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
    </svg>
  );
}

// Create a singleton instance
export const highlighterTool = new HighlighterTool();