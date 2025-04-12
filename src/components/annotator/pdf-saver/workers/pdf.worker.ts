'use client';

import { PDFDocument } from 'pdf-lib';

interface ProcessMessage {
  type: 'process';
  pdfBytes: ArrayBuffer;
  svgData: string;
  pageNumber: number;
  totalPages: number;
}

interface ProgressMessage {
  type: 'progress';
  pageNumber: number;
  totalPages: number;
  status: string;
}

interface CompleteMessage {
  type: 'complete';
  pageNumber: number;
  pdfBytes: ArrayBuffer;
}

interface ErrorMessage {
  type: 'error';
  error: string;
  pageNumber: number;
}

type WorkerMessage = ProgressMessage | CompleteMessage | ErrorMessage;

function logDebug(msg: string, data?: any) {
  // @ts-ignore
  if (self.name === 'debugWorker') {
    console.debug(`[PDFWorker] ${msg}`, data);
  }
}

// Handle messages from main thread
self.onmessage = async (e: MessageEvent<ProcessMessage>) => {
  const msg = e.data;

  if (msg.type === 'process') {
    try {
      logDebug('Received process message', {
        pageNumber: msg.pageNumber,
        svgLength: msg.svgData.length,
        pdfSize: msg.pdfBytes.byteLength
      });

      // Report start
      self.postMessage({
        type: 'progress',
        pageNumber: msg.pageNumber,
        totalPages: msg.totalPages,
        status: 'Loading PDF...'
      } satisfies ProgressMessage);

      // Load PDF
      logDebug('Loading PDF document');
      const pdfDoc = await PDFDocument.load(msg.pdfBytes);
      logDebug('PDF loaded');
      
      // Get the current page
      const pages = pdfDoc.getPages();
      const page = pages[msg.pageNumber - 1];
      logDebug('Got page', { pageNumber: msg.pageNumber, dimensions: page.getSize() });

      // Report progress
      self.postMessage({
        type: 'progress',
        pageNumber: msg.pageNumber,
        totalPages: msg.totalPages,
        status: 'Converting annotations...'
      } satisfies ProgressMessage);

      // Create temporary canvas
      logDebug('Creating canvas');
      const canvas = new OffscreenCanvas(page.getWidth(), page.getHeight());
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Create image from SVG
      logDebug('Creating SVG blob');
      const svgBlob = new Blob([msg.svgData], { type: 'image/svg+xml' });
      
      logDebug('Creating image bitmap');
      const img = await createImageBitmap(svgBlob);
      logDebug('Image bitmap created');

      // Draw to canvas
      logDebug('Drawing to canvas');
      ctx.drawImage(img, 0, 0);

      // Get image data
      logDebug('Converting to PNG');
      const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
      logDebug('Getting array buffer');
      const pngBuffer = await pngBlob.arrayBuffer();
      logDebug('Got PNG buffer', { size: pngBuffer.byteLength });

      // Embed in PDF
      logDebug('Embedding PNG in PDF');
      const image = await pdfDoc.embedPng(new Uint8Array(pngBuffer));
      const { width, height } = page.getSize();
      
      logDebug('Drawing image on page');
      page.drawImage(image, {
        x: 0,
        y: 0,
        width,
        height
      });

      // Save modified PDF
      logDebug('Saving PDF');
      const modifiedPdfBytes = await pdfDoc.save();
      logDebug('PDF saved', { size: modifiedPdfBytes.length });

      // Create transferable ArrayBuffer from Uint8Array
      const buffer = modifiedPdfBytes.buffer.slice(0);

      // Send back result with transferable buffer
      logDebug('Sending complete message');
      const completeMessage: CompleteMessage = {
        type: 'complete',
        pageNumber: msg.pageNumber,
        pdfBytes: buffer as ArrayBuffer
      };

      self.postMessage(completeMessage, {
        transfer: [buffer]
      });

      logDebug('Complete message sent');

    } catch (error) {
      logDebug('Error occurred', error);
      
      // Send error message
      self.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : String(error),
        pageNumber: msg.pageNumber
      } satisfies ErrorMessage);
    } finally {
      logDebug('Processing complete');
    }
  }
};

// Enable debugging if needed
// @ts-ignore
self.name = 'debugWorker';

// Tell TypeScript this is a module
export {};