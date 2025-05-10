'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Label } from './LabelOverlay';
import { ErrorBoundary } from 'react-error-boundary';

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { 
  error: Error; 
  resetErrorBoundary: () => void 
}) => {
  return (
    <div className="text-center p-5 bg-red-100 text-red-700 rounded m-4">
      <h3 className="font-semibold mb-2">Error loading PDF viewer</h3>
      <p className="mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
};

// Empty placeholder component to prevent import errors
const EmptyComponent = () => <div>Loading PDF viewer...</div>;

// Dynamically import PDF components to ensure they only load on the client
const PDFViewerComponent = dynamic(
  () => 
    import('./PdfViewerInner').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-full w-full bg-[#1a1a1a] text-white p-10">
        <p>Loading PDF viewer...</p>
      </div>
    ),
  }
);

interface NextPdfViewerProps {
  fileUrl: string;
  onDocumentLoad?: () => void;
  height?: string;
  className?: string;
  selectedLabel?: {
    type: string;
    color: string;
    icon: string;
  };
  onLabelsChange?: (labels: Label[]) => void;
  initialLabels?: Label[];
}

export default function NextPdfViewer({
  fileUrl,
  onDocumentLoad,
  height = 'calc(100vh - 250px)',
  className = '',
  selectedLabel,
  onLabelsChange,
  initialLabels = [],
}: NextPdfViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [key, setKey] = useState(`pdf-${Date.now()}`);

  // Only mount component on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Force remount PDF viewer component when URL changes
  useEffect(() => {
    if (mounted) {
      setKey(`pdf-${fileUrl}-${Date.now()}`);
    }
  }, [fileUrl, mounted]);

  // Handle labels change
  const handleLabelsChange = useCallback((labels: Label[]) => {
    if (onLabelsChange) {
      onLabelsChange(labels);
    }
  }, [onLabelsChange]);

  // Reset any PDF errors
  const handleReset = useCallback(() => {
    // Simply remount the component with a new key
    setKey(`pdf-${fileUrl}-${Date.now()}`);
  }, [fileUrl]);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-full w-full bg-[#1a1a1a] text-white p-10">
        <p>Initializing PDF viewer...</p>
      </div>
    );
  }

  return (
    <div className={`h-full ${className}`}>
      <ErrorBoundary 
        FallbackComponent={ErrorFallback} 
        onReset={handleReset}
        key={`error-boundary-${key}`}
      >
        <PDFViewerComponent
          key={key}
          fileUrl={fileUrl}
          onDocumentLoad={onDocumentLoad}
          height={height}
          className={className}
          selectedLabel={selectedLabel}
          onLabelsChange={handleLabelsChange}
          initialLabels={initialLabels}
        />
      </ErrorBoundary>
    </div>
  );
} 