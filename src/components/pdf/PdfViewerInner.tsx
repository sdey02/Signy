'use client';

import { useState, useEffect } from 'react';
import { Viewer, SpecialZoomLevel, Worker, LoadError } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { fullScreenPlugin } from '@react-pdf-viewer/full-screen';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { LabelContainer } from './LabelContainer';
import { Label } from './LabelOverlay';

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

  // Load initial labels
  useEffect(() => {
    setAllLabels(initialLabels);
  }, [initialLabels]);

  // Create plugins with custom layout options 
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [], // Remove the sidebar completely
  });
  
  const fullScreenPluginInstance = fullScreenPlugin();
  const zoomPluginInstance = zoomPlugin();

  // Set up worker URL and handle proxy for file URL if needed
  useEffect(() => {
    const setup = async () => {
      try {
        // For worker: Use local worker directly to avoid fetch issues
        setWorkerUrl('/pdf-worker/pdf.worker.min.js');
        
        // Check if we need to proxy the PDF URL (for CORS issues)
        if (fileUrl && fileUrl.startsWith('http')) {
          // Check if it's a BackBlaze URL
          if (fileUrl.includes('backblazeb2.com')) {
            console.log('Using B2 download API for BackBlaze URL');
            setProxyFileUrl(`/api/b2/download-pdf?url=${encodeURIComponent(fileUrl)}`);
          } else {
            try {
              // For non-BackBlaze URLs, test direct access first
              const headResponse = await fetch(fileUrl, { method: 'HEAD' });
              if (headResponse.ok) {
                setProxyFileUrl(fileUrl);
              } else {
                // If direct access fails, use general proxy
                console.log('Direct PDF access failed, using proxy');
                setProxyFileUrl(`/api/proxy-pdf?url=${encodeURIComponent(fileUrl)}`);
              }
            } catch (error) {
              console.error('Error testing PDF access:', error);
              // If any error occurs, use the proxy
              console.log('Error accessing PDF directly, using proxy');
              setProxyFileUrl(`/api/proxy-pdf?url=${encodeURIComponent(fileUrl)}`);
            }
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing PDF viewer:', error);
        setError('Failed to initialize PDF viewer. Please try again later.');
        setIsLoading(false);
      }
    };

    setup();
  }, [fileUrl]);

  // Handle errors
  const handleError = (error: LoadError) => {
    console.error('Error loading PDF:', error);
    let errorMessage = error.message || 'Unknown error loading PDF';
    
    // Provide more helpful message for common errors
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      errorMessage = 'Failed to load the PDF file. This may be due to CORS restrictions or the file is not accessible.';
    }
    
    setError(errorMessage);
  };

  const handlePageChange = (e: any) => {
    setCurrentPage(e.currentPage);
  };

  const handleLabelsChange = (pageLabels: Label[]) => {
    setAllLabels(pageLabels);
    if (onLabelsChange) {
      onLabelsChange(pageLabels);
    }
  };

  // Handle zoom level changes
  const handleZoomChange = (e: any) => {
    const newScale = e.scale;
    setScale(newScale);
  };

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
        <div className="relative h-full">
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
              handleError(error);
              return (
                <div className="text-center p-5 bg-red-100 text-red-700 rounded">
                  <p>Failed to load PDF: {error.message || 'Unknown error'}</p>
                  <p className="mt-2 text-sm">URL: {proxyFileUrl}</p>
                </div>
              );
            }}
          />
          <div 
            className="absolute inset-0"
            style={{ 
              zIndex: 999,
              pointerEvents: selectedLabel?.type ? 'auto' : 'none' 
            }}
            onClick={() => console.log("Outer container clicked")}
          >
            <LabelContainer
              pageNumber={currentPage}
              scale={scale}
              onLabelsChange={handleLabelsChange}
              selectedLabel={selectedLabel}
              existingLabels={allLabels}
            />
          </div>
        </div>
      </Worker>
    </div>
  );
} 