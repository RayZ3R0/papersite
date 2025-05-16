import React from 'react';
import { AbstractTool, ToolButton, ToolPreviewContainer } from './BaseTool';
import { PreviewProps, ToolRenderProps, ToolSettings } from '../../types/tools';

export class PenTool extends AbstractTool {
  constructor() {
    super(
      'pen',
      'Pen',
      PenIcon,
      'P'
    );
  }

  settings: ToolSettings[] = [
    {
      id: 'color',
      type: 'color',
      label: 'Color',
      value: '#000000'
    },
    {
      id: 'size',
      type: 'size',
      label: 'Stroke Size',
      value: 2,
      min: 1,
      max: 20
    }
  ];

  getPreview({ size, color }: PreviewProps): React.ReactNode {
    const previewSize = Math.min(16, size);
    
    return (
      <ToolPreviewContainer>
        <div 
          className="rounded-full" 
          style={{ 
            width: `${previewSize}px`, 
            height: `${previewSize}px`,
            backgroundColor: color
          }} 
        />
      </ToolPreviewContainer>
    );
  }

  render(props: ToolRenderProps): JSX.Element {
    return (
      <ToolButton
        {...props}
        icon={PenIcon}
        name={this.name}
        shortcut={this.shortcut}
      />
    );
  }
}

function PenIcon({ className = '' }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
  );
}

// Create a singleton instance
export const penTool = new PenTool();