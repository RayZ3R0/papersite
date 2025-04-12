import PDFSaver from '../../PDFSaver';
import { PDFModifier, SVGGenerator, CoordinateMapper } from '..';
import { Stroke } from '@/lib/annotationStore';
import { PDFDocument } from 'pdf-lib';

// Mock PDF file
const mockPDF = new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46])], { type: 'application/pdf' });

// Mock stroke data
const mockStrokes: Stroke[] = [
  {
    points: [
      { x: 100, y: 100, pressure: 0.5 },
      { x: 200, y: 200, pressure: 0.5 }
    ],
    color: '#000000',
    size: 2,
    opacity: 1,
    tool: 'pen'
  }
];

describe('PDFSaver', () => {
  let saver: PDFSaver;

  beforeEach(() => {
    saver = new PDFSaver(mockPDF);
  });

  test('should initialize without errors', () => {
    expect(saver).toBeDefined();
  });

  test('should handle empty annotations', async () => {
    const annotations = new Map<number, Stroke[]>();
    const result = await saver.save(annotations);
    expect(result).toBeInstanceOf(Blob);
  });
});

describe('CoordinateMapper', () => {
  const viewport = { width: 800, height: 600, scale: 1 };
  const pdfDimensions = { width: 595, height: 842 };
  const mapper = new CoordinateMapper(viewport, pdfDimensions);

  test('should map points correctly', () => {
    const point = { x: 100, y: 100, pressure: 0.5 };
    const mapped = mapper.mapPoint(point);
    expect(mapped.pdfX).toBeDefined();
    expect(mapped.pdfY).toBeDefined();
  });

  test('should map stroke size', () => {
    const size = 2;
    const mapped = mapper.mapStrokeSize(size);
    expect(mapped).toBeGreaterThan(0);
  });
});

describe('SVGGenerator', () => {
  const dimensions = {
    width: 595,
    height: 842,
    viewport: {
      width: 595,
      height: 842,
      scale: 1
    }
  };
  
  const generator = new SVGGenerator(dimensions);

  test('should generate valid SVG', () => {
    const svg = generator.generateSVG(mockStrokes);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  test('should handle eraser strokes', () => {
    const eraserStrokes = [{
      ...mockStrokes[0],
      tool: 'eraser' as const
    }];
    const masks = generator.generateEraserMasks(eraserStrokes);
    expect(masks.length).toBe(1);
  });
});

describe('PDFModifier', () => {
  let modifier: PDFModifier;
  const annotations = new Map<number, Stroke[]>([[1, mockStrokes]]);

  beforeAll(async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const pdfBytes = await pdfDoc.save();

    modifier = new PDFModifier({
      pdfBytes: pdfBytes.buffer as ArrayBuffer,
      annotations,
      onProgress: () => {}
    });
  });

  test('should process PDF without errors', async () => {
    const result = await modifier.process();
    expect(result).toBeInstanceOf(Uint8Array);
  });
});