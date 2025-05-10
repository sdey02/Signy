'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Viewer, SpecialZoomLevel, Worker, LoadError } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { fullScreenPlugin } from '@react-pdf-viewer/full-screen';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { LabelContainer } from './LabelContainer';
import { Label } from './LabelOverlay';
import { getPdfProxyUrl, getPdfErrorMessage } from '@/utils/pdf-utils';

// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/full-screen/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

interface PdfViewerInnerProps {
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

export default function PdfViewerInner({
  fileUrl,
  onDocumentLoad,
  height = '100%',
  className = '',
  selectedLabel,
  onLabelsChange,
  initialLabels = [],
}: PdfViewerInnerProps) {
  const [workerUrl, setWorkerUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [proxyFileUrl, setProxyFileUrl] = useState(fileUrl);
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [allLabels, setAllLabels] = useState<Label[]>(initialLabels);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Keep track of which pages have been seen to correctly place labels
  const [seenPages, setSeenPages] = useState<Set<number>>(new Set());

  // Load initial labels
  useEffect(() => {
    setAllLabels(initialLabels);
  }, [initialLabels]);

  // Create plugins with custom layout options 
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [], // Remove the sidebar completely
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const {
            CurrentPageInput,
            Download,
            EnterFullScreen,
            GoToNextPage,
            GoToPreviousPage,
            NumberOfPages,
            Print,
            ZoomIn,
            ZoomOut,
          } = slots;
          return (
            <div className="flex items-center justify-between w-full px-2 py-1 bg-[#252525] text-white">
              <div className="flex items-center">
                <GoToPreviousPage />
                <GoToNextPage />
                <div className="mx-2 flex items-center">
                  <CurrentPageInput /> / <NumberOfPages />
                </div>
              </div>
              <div className="flex items-center">
                <ZoomOut />
                <ZoomIn />
                <EnterFullScreen />
                <Download />
                <Print />
              </div>
            </div>
          );
        }}
      </Toolbar>
    ),
  });
  
  const fullScreenPluginInstance = fullScreenPlugin();
  const zoomPluginInstance = zoomPlugin();

  // Set up worker URL and handle proxy for file URL if needed
  useEffect(() => {
    const setup = async () => {
      try {
        // For worker: Use local worker directly to avoid fetch issues
        setWorkerUrl('/pdf-worker/pdf.worker.min.js');
        
        // Process the URL through our utility function
        setProxyFileUrl(getPdfProxyUrl(fileUrl));
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing PDF viewer:', err);
        setError('Failed to initialize PDF viewer. Please try again later.');
        setIsLoading(false);
      }
    };

    setup();
  }, [fileUrl]);

  // Create a separate handler that will be called from the component
  const handleError = useCallback((error: LoadError) => {
    console.error('Error loading PDF:', error);
    
    // Use our utility to get a user-friendly error message
    const errorMessage = getPdfErrorMessage(error);
    
    // Use setTimeout to avoid React state updates during render
    setTimeout(() => {
      setError(errorMessage);
    }, 0);
  }, []);

  const handlePageChange = useCallback((e: any) => {
    const newPage = e.currentPage;
    
    // Track that we've seen this page
    setSeenPages(prev => new Set([...prev, newPage]));
    
    // Update current page - use setTimeout to avoid setState during render
    setTimeout(() => {
      setCurrentPage(newPage);
    }, 0);
  }, []);

  const handleLabelsChange = useCallback((pageLabels: Label[]) => {
    setAllLabels(pageLabels);
    if (onLabelsChange) {
      onLabelsChange(pageLabels);
    }
  }, [onLabelsChange]);

  // Handle zoom level changes
  const handleZoomChange = useCallback((e: any) => {
    const newScale = e.scale;
    setTimeout(() => {
      setScale(newScale);
    }, 0);
  }, []);

  useEffect(() => {
    console.log("PdfViewerInner selectedLabel changed:", selectedLabel);
  }, [selectedLabel]);

  if (isLoading || !workerUrl) {
    return (
      <div className="flex justify-center items-center h-full w-full bg-[#1a1a1a] text-white p-10">
        <p>Loading PDF viewer...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-5 bg-red-100 text-red-700 rounded">
        <p>Failed to load PDF: {error}</p>
      </div>
    );
  }

  return (
    <div className={`bg-[#252525] w-full ${className}`} style={{ height }}>
      <Worker workerUrl={workerUrl}>
        <div className="flex flex-col h-full overflow-hidden">
          <div 
            className="relative flex-grow overflow-auto" 
            ref={pdfContainerRef}
            style={{ 
              height: '100%',
              position: 'relative'
            }}
          >
            <Viewer
              fileUrl={proxyFileUrl}
              plugins={[
                defaultLayoutPluginInstance,
                fullScreenPluginInstance,
                zoomPluginInstance,
              ]}
              defaultScale={SpecialZoomLevel.PageFit}
              theme="dark"
              onDocumentLoad={onDocumentLoad}
              onPageChange={handlePageChange}
              onZoom={handleZoomChange}
              renderError={(error) => {
                // Schedule the error handling to avoid setState during render
                setTimeout(() => handleError(error), 0);
                
                return (
                  <div className="text-center p-5 bg-red-100 text-red-700 rounded">
                    <p>Failed to load PDF: {error.message || 'Unknown error'}</p>
                    <p className="mt-2 text-sm">URL: {proxyFileUrl}</p>
                  </div>
                );
              }}
              renderLoader={(percentages: number) => (
                <div className="flex items-center justify-center h-full bg-[#252525]">
                  <div className="text-center">
                    <div className="text-white mb-2">Loading PDF...</div>
                    <div className="w-48 h-2 bg-gray-700 rounded-full">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${Math.max(5, percentages)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            />
            
            {/* Only render LabelContainer if currentPage is valid */}
            {currentPage > 0 && (
              <LabelContainer
                pageNumber={currentPage}
                scale={scale}
                onLabelsChange={handleLabelsChange}
                selectedLabel={selectedLabel}
                existingLabels={allLabels}
                containerRef={pdfContainerRef}
              />
            )}
          </div>
        </div>
      </Worker>
    </div>
  );
} 