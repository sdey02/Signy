/**
 * Configuration for PDF.js
 * This is used to handle initialization and worker settings for PDF.js
 */

// Ensure we're in a browser environment before requiring any PDF.js components
const isBrowser = typeof window !== 'undefined';

// The path to the pdf.worker.js file
export const getPdfWorkerSrc = () => {
  // Try CDN first but have a local fallback
  return {
    cdnWorkerUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
    localWorkerUrl: '/pdf-worker/pdf.worker.min.js'
  };
};

// Helper to check if we're in a browser environment
export const isPdfSupported = () => {
  return isBrowser;
}; 