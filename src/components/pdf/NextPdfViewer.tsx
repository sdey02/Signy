'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

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
}

export default function NextPdfViewer({
  fileUrl,
  onDocumentLoad,
  height = 'calc(100vh - 250px)',
  className = '',
}: NextPdfViewerProps) {
  const [mounted, setMounted] = useState(false);

  // Only mount component on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-full w-full bg-[#1a1a1a] text-white p-10">
        <p>Initializing PDF viewer...</p>
      </div>
    );
  }

  return (
    <PDFViewerComponent
      fileUrl={fileUrl}
      onDocumentLoad={onDocumentLoad}
      height={height}
      className={className}
    />
  );
} 