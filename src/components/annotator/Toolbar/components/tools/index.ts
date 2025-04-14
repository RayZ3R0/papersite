import { BaseTool } from '../../types/tools';
import { penTool } from './PenTool';
import { highlighterTool } from './HighlighterTool';
import { eraserTool } from './EraserTool';

// Register all tools here
export const tools: BaseTool[] = [
  penTool,
  highlighterTool,
  eraserTool
];

// Export individual tools
export { penTool, highlighterTool, eraserTool };

// Utility functions
export function getToolById(id: string): BaseTool | undefined {
  return tools.find(tool => tool.id === id);
}

export function getDefaultTool(): BaseTool {
  return penTool;
}

// Export tool-related components
export { ToolPreviewContainer } from './BaseTool';

// Re-export types
export type { BaseTool } from '../../types/tools';