'use client';

import { Stroke } from '@/lib/annotationStore';
import StrokeRenderer from '../rendering/StrokeRenderer';
import CoordinateMapper from './CoordinateMapper';
import type { ViewportDimensions } from './types';

export interface SVGGeneratorOptions {
  width: number;
  height: number;
  viewport: ViewportDimensions;
  optimizePaths?: boolean;
  preservePressure?: boolean;
}

/**
 * Generates SVG content from strokes with proper PDF coordinate mapping
 */
export default class SVGGenerator {
  private svg: SVGSVGElement;
  private defs: SVGDefsElement;
  private mapper: CoordinateMapper;

  constructor(options: SVGGeneratorOptions) {
    console.debug('[SVGGenerator] Initializing', options);

    this.mapper = new CoordinateMapper(
      options.viewport,
      { width: options.width, height: options.height }
    );
    
    try {
      // Create SVG container
      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svg.setAttribute('width', String(options.width));
      this.svg.setAttribute('height', String(options.height));
      this.svg.setAttribute('viewBox', `0 0 ${options.width} ${options.height}`);
      
      // Add defs section for any shared elements
      this.defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      this.svg.appendChild(this.defs);

      console.debug('[SVGGenerator] SVG container created');
    } catch (error) {
      console.error('[SVGGenerator] Failed to create SVG:', error);
      throw error;
    }
  }

  /**
   * Convert a stroke to SVG path with proper coordinate mapping
   */
  private strokeToPath(stroke: Stroke): SVGPathElement {
    console.debug('[SVGGenerator] Converting stroke to path', {
      points: stroke.points.length,
      tool: stroke.tool
    });

    try {
      // Create stroke renderer with export mode
      const renderer = new StrokeRenderer(stroke, {
        scale: 1,
        smoothing: true,
        forExport: true
      });

      // Get vector path and map coordinates
      const pathData = renderer.toVectorPath();
      const mappedPath = this.mapper.mapPath(pathData);
      
      console.debug('[SVGGenerator] Path generated', {
        original: pathData.length,
        mapped: mappedPath.length
      });

      // Create path element
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', mappedPath);
      path.setAttribute('stroke', stroke.color);
      path.setAttribute('stroke-width', String(this.mapper.mapStrokeSize(stroke.size)));
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('vector-effect', 'non-scaling-stroke');

      // Handle different tools
      if (stroke.tool === 'highlighter') {
        path.setAttribute('stroke-opacity', String(stroke.opacity));
        path.setAttribute('mix-blend-mode', 'multiply');
      } else if (stroke.tool === 'eraser') {
        path.setAttribute('data-tool', 'eraser');
      }

      return path;
    } catch (error) {
      console.error('[SVGGenerator] Failed to create path:', error);
      throw error;
    }
  }

  /**
   * Generate full SVG content for a collection of strokes
   */
  generateSVG(strokes: Stroke[]): string {
    console.debug('[SVGGenerator] Generating SVG', { strokeCount: strokes.length });

    try {
      // Clear any existing content
      while (this.svg.lastChild) {
        if (this.svg.lastChild !== this.defs) {
          this.svg.removeChild(this.svg.lastChild);
        }
      }

      // Sort strokes by tool type to handle layering
      const sortedStrokes = [...strokes].sort((a, b) => {
        if (a.tool === 'highlighter' && b.tool !== 'highlighter') return -1;
        if (a.tool !== 'highlighter' && b.tool === 'highlighter') return 1;
        return 0;
      });

      // Create a background rect to ensure proper rendering
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('width', '100%');
      bg.setAttribute('height', '100%');
      bg.setAttribute('fill', 'transparent');
      this.svg.appendChild(bg);

      // Process each stroke
      for (const stroke of sortedStrokes) {
        if (stroke.tool !== 'eraser') {
          this.svg.appendChild(this.strokeToPath(stroke));
        }
      }

      // Get SVG string
      const svgString = new XMLSerializer().serializeToString(this.svg);
      console.debug('[SVGGenerator] SVG generated', { length: svgString.length });

      return svgString;
    } catch (error) {
      console.error('[SVGGenerator] Failed to generate SVG:', error);
      throw error;
    }
  }

  /**
   * Get eraser masks for handling eraser strokes
   */
  generateEraserMasks(strokes: Stroke[]): SVGElement[] {
    console.debug('[SVGGenerator] Generating eraser masks');
    return strokes
      .filter(stroke => stroke.tool === 'eraser')
      .map(stroke => this.strokeToPath(stroke));
  }

  /**
   * Clean up any resources
   */
  dispose() {
    console.debug('[SVGGenerator] Disposing resources');
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
  }
}