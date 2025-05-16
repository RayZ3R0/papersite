import { ReactNode } from 'react';

export type ToolType = 'pen' | 'highlighter' | 'eraser';

export interface Position {
  x: number;
  y: number;
}

export interface ToolSettings {
  id: string;
  type: 'color' | 'size' | 'opacity';
  label: string;
  value: any;
  min?: number;
  max?: number;
  step?: number;
}

export interface PreviewProps {
  size: number;
  color?: string;
  opacity?: number;
}

export interface ToolRenderProps {
  isActive: boolean;
  size: number;
  color?: string;
  opacity?: number;
  onSelect: () => void;
}

export interface BaseTool {
  id: ToolType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  settings?: ToolSettings[];
  render: (props: ToolRenderProps) => JSX.Element;
  getPreview: (props: PreviewProps) => ReactNode;
}

export interface ToolbarState {
  activeTool: ToolType;
  currentColor: string;
  strokeSize: number;
  opacity: number;
  isVisible: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

export interface ToolbarActions {
  handleToolChange: (tool: ToolType) => void;
  handleColorChange: (color: string) => void;
  handleSizeChange: (size: number) => void;
  handleOpacityChange: (value: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
  onSave?: () => void;
  setIsVisible: (value: boolean) => void;
}