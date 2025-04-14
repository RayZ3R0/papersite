import React from 'react';
import { ToolbarState, ToolbarActions, BaseTool } from '../../types/tools';
import { tools } from '../tools';
import ColorPicker from '../../ColorPicker';
import { Slider } from './index';

export interface ToolbarBaseProps extends ToolbarState, ToolbarActions {
  variant: 'desktop' | 'mobile';
  renderHeader?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
}

export function ToolbarBase({
  variant,
  activeTool,
  currentColor,
  strokeSize,
  opacity,
  isVisible,
  canUndo,
  canRedo,
  handleToolChange,
  handleColorChange,
  handleSizeChange,
  handleOpacityChange,
  onUndo,
  onRedo,
  onClear,
  onSave,
  renderHeader,
  renderFooter
}: ToolbarBaseProps) {
  const currentToolInstance = tools.find(t => t.id === activeTool);

  const renderTools = () => (
    <div className="grid grid-cols-3 gap-2">
      {tools.map(tool => (
        <div 
          key={tool.id}
          className="transform transition-transform duration-200 ease-out"
          style={{
            transform: activeTool === tool.id ? 'scale(1.05)' : 'scale(1)'
          }}
        >
          {tool.render({
            isActive: activeTool === tool.id,
            size: strokeSize,
            color: currentColor,
            opacity,
            onSelect: () => handleToolChange(tool.id)
          })}
        </div>
      ))}
    </div>
  );

  const renderSettings = () => {
    if (!currentToolInstance) return null;

    return (
      <div className="space-y-4">
        {currentToolInstance.settings?.map(setting => {
          switch (setting.type) {
            case 'color':
              return (
                <div 
                  key={setting.id}
                  className="space-y-2 transform transition-all duration-300 ease-out"
                  style={{ 
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(10px)'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {setting.label}
                    </span>
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      {currentColor}
                    </span>
                  </div>
                  <ColorPicker
                    currentColor={currentColor}
                    onColorChange={handleColorChange}
                  />
                </div>
              );

            case 'size':
            case 'opacity':
              const value = setting.type === 'size' ? strokeSize : opacity;
              const handler = setting.type === 'size' ? handleSizeChange : handleOpacityChange;
              const preview = currentToolInstance.getPreview({ size: strokeSize, color: currentColor, opacity });

              return (
                <div 
                  key={setting.id}
                  className="transform transition-all duration-300 ease-out"
                  style={{ 
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                    transitionDelay: '50ms'
                  }}
                >
                  <Slider
                    label={setting.label}
                    value={value}
                    onChange={handler}
                    min={setting.min}
                    max={setting.max}
                    step={setting.step}
                    preview={preview}
                  />
                </div>
              );
          }
        })}
      </div>
    );
  };

  const renderActions = () => (
    <div 
      className="grid grid-cols-2 gap-2 transform transition-all duration-300 ease-out"
      style={{ 
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transitionDelay: '100ms'
      }}
    >
      {/* Undo/Redo */}
      <div className="flex gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex-1 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200 hover:bg-gray-100 active:scale-95"
        >
          Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="flex-1 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200 hover:bg-gray-100 active:scale-95"
        >
          Redo
        </button>
      </div>

      {/* Clear/Save */}
      <div className="flex gap-2">
        <button
          onClick={onClear}
          className="flex-1 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 
            hover:bg-red-50 hover:text-red-600
            border border-gray-200 dark:border-gray-700
            transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Clear
        </button>
        <button
          onClick={onSave}
          className="flex-1 py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 
            text-blue-600 dark:text-blue-400
            border border-blue-200 dark:border-blue-800/50
            transition-all duration-200 hover:scale-105 active:scale-95
            hover:bg-blue-100 dark:hover:bg-blue-900/40"
        >
          Save
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderHeader?.()}
      <div className="space-y-6 px-4">
        <div className="transform transition-all duration-300 ease-out"
          style={{ 
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(10px)'
          }}
        >
          {renderTools()}
        </div>
        {renderSettings()}
        {renderActions()}
      </div>
      {renderFooter?.()}
    </div>
  );
}