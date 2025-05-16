export type ToolType = 'pen' | 'highlighter' | 'eraser';

export interface Position {
  x: number;
  y: number;
}

export interface ToolbarProps {
  currentTool?: ToolType;
  onToolChange?: (tool: ToolType) => void;
  
  currentColor?: string;
  onColorChange?: (color: string) => void;
  
  currentSize?: number;
  onSizeChange?: (size: number) => void;
  
  currentOpacity?: number;
  onOpacityChange?: (value: number) => void;
  
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
  onSave?: () => void;
  
  initiallyVisible?: boolean;
  position?: Position;
}

// Tool settings configuration
interface ToolSettingsBase {
  minSize: number;
  maxSize: number;
  defaultSize: number;
}

interface ColoredToolSettings extends ToolSettingsBase {
  defaultColor: string;
}

interface HighlighterSettings extends ColoredToolSettings {
  minOpacity: number;
  maxOpacity: number;
  defaultOpacity: number;
}

export interface ToolSettings {
  pen: ColoredToolSettings;
  highlighter: HighlighterSettings;
  eraser: ToolSettingsBase;
}

// Default settings for tools
export const defaultToolSettings: ToolSettings = {
  pen: {
    minSize: 1,
    maxSize: 10,
    defaultSize: 2,
    defaultColor: '#000000'
  },
  highlighter: {
    minSize: 5,
    maxSize: 20,
    defaultSize: 10,
    defaultColor: '#ffeb3b',
    minOpacity: 0.1,
    maxOpacity: 0.5,
    defaultOpacity: 0.3
  },
  eraser: {
    minSize: 5,
    maxSize: 40,
    defaultSize: 20
  }
};

// Color presets
export interface ColorPreset {
  color: string;
  name: string;
}

export const colorPresets: ColorPreset[] = [
  // Reds
  { color: '#ef4444', name: 'Red' },
  { color: '#f97316', name: 'Orange' },
  { color: '#f59e0b', name: 'Amber' },

  // Greens
  { color: '#22c55e', name: 'Green' },
  { color: '#10b981', name: 'Emerald' },
  { color: '#06b6d4', name: 'Cyan' },

  // Blues
  { color: '#3b82f6', name: 'Blue' },
  { color: '#6366f1', name: 'Indigo' },
  { color: '#8b5cf6', name: 'Violet' },

  // Neutrals
  { color: '#000000', name: 'Black' },
  { color: '#4b5563', name: 'Gray' },
  { color: '#6b7280', name: 'Cool Gray' }
];

// Shared component props
export interface BaseToolbarProps {
  activeTool: ToolType;
  currentColor: string;
  strokeSize: number;
  opacity: number;
  isVisible: boolean;
  canUndo: boolean;
  canRedo: boolean;
  
  handleToolChange: (tool: ToolType) => void;
  handleColorChange: (color: string) => void;
  handleSizeChange: (size: number) => void;
  handleOpacityChange: (opacity: number) => void;
  
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
  onSave?: () => void;
  setIsVisible: (visible: boolean) => void;
}

export interface DesktopToolbarProps extends BaseToolbarProps {
  initialPosition?: Position;
}

export interface MobileToolbarProps extends BaseToolbarProps {}