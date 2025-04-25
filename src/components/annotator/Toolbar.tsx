import { ToolbarProps } from '@/types/annotator';
import '@/styles/annotator.css';

export default function Toolbar({
  activeTool,
  penColor,
  strokeWidth,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      {/* Tool Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => onToolChange('pen')}
          className={`tool-button ${activeTool === 'pen' ? 'active' : ''}`}
          title="Pen Tool"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" />
            <path d="M11 11l-4 4" />
          </svg>
        </button>

        <button
          onClick={() => onToolChange('eraser')}
          className={`tool-button ${activeTool === 'eraser' ? 'active' : ''}`}
          title="Eraser Tool"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 20H7L3 16c-1.5-1.5-1.5-3.5 0-5L14 0l7 7-11 11 3 3h7v-1Z" />
          </svg>
        </button>
      </div>

      {/* Color Picker (only visible when pen tool is active) */}
      {activeTool === 'pen' && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={penColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer bg-transparent"
            title="Pick Color"
          />
        </div>
      )}

      {/* Stroke Width Slider */}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
          className="stroke-width-slider"
          title="Adjust Stroke Width"
        />
        <span className="text-sm text-text-muted min-w-[3ch]">{strokeWidth}</span>
      </div>

      {/* Preview of current tool */}
      <div className="tool-preview" title="Tool Preview">
        <div
          style={{
            width: `${strokeWidth}px`,
            height: `${strokeWidth}px`,
            backgroundColor: activeTool === 'pen' ? penColor : '#000',
            borderRadius: '50%',
            opacity: activeTool === 'eraser' ? 0.5 : 1,
          }}
        />
      </div>
    </div>
  );
}