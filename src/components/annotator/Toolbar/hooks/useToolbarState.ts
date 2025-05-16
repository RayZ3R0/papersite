import { useState, useCallback } from 'react';
import { ToolType, ToolbarState, ToolbarActions } from '../types/tools';
import { getDefaultTool, getToolById } from '../components/tools';

export interface UseToolbarState extends ToolbarState, ToolbarActions {
  resetState: () => void;
}

const defaultState: ToolbarState = {
  activeTool: getDefaultTool().id,
  currentColor: '#000000',
  strokeSize: 2,
  opacity: 0.3,
  isVisible: true,
  canUndo: false,
  canRedo: false,
};

export function useToolbarState(): UseToolbarState {
  const [state, setState] = useState<ToolbarState>(defaultState);

  const handleToolChange = useCallback((tool: ToolType) => {
    const toolInstance = getToolById(tool);
    if (!toolInstance) return;

    setState(prev => {
      // Get default settings for the tool
      const colorSetting = toolInstance.settings?.find(s => s.id === 'color');
      const sizeSetting = toolInstance.settings?.find(s => s.id === 'size');
      const opacitySetting = toolInstance.settings?.find(s => s.id === 'opacity');

      return {
        ...prev,
        activeTool: tool,
        // Apply tool-specific defaults if available
        currentColor: colorSetting?.value || prev.currentColor,
        strokeSize: sizeSetting?.value || prev.strokeSize,
        opacity: opacitySetting?.value || prev.opacity,
      };
    });
  }, []);

  const handleColorChange = useCallback((color: string) => {
    setState(prev => ({
      ...prev,
      currentColor: color,
    }));
  }, []);

  const handleSizeChange = useCallback((size: number) => {
    setState(prev => ({
      ...prev,
      strokeSize: size,
    }));
  }, []);

  const handleOpacityChange = useCallback((value: number) => {
    setState(prev => ({
      ...prev,
      opacity: value,
    }));
  }, []);

  const setIsVisible = useCallback((value: boolean) => {
    setState(prev => ({
      ...prev,
      isVisible: value,
    }));
  }, []);

  const resetState = useCallback(() => {
    setState(defaultState);
  }, []);

  return {
    ...state,
    handleToolChange,
    handleColorChange,
    handleSizeChange,
    handleOpacityChange,
    setIsVisible,
    resetState,
  };
}

// Export a context-based version if needed for larger applications
export function createToolbarStore() {
  const state = useToolbarState();
  return state;
}