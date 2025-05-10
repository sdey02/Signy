import { useState, useEffect, useCallback } from 'react';
import { Label } from '@/components/pdf/LabelOverlay';

interface UsePdfViewerProps {
  fileUrl: string;
  initialLabels?: Label[];
}

interface UsePdfViewerReturn {
  pdfUrl: string;
  labels: Label[];
  isLoading: boolean;
  error: string | null;
  selectedLabel: { type: string; color: string; icon: string; } | undefined;
  setSelectedLabel: (label: { type: string; color: string; icon: string; } | undefined) => void;
  handleLabelsChange: (newLabels: Label[]) => void;
  clearError: () => void;
  reloadPdf: () => void;
}

/**
 * Custom hook for managing PDF viewer state and functionality
 */
export const usePdfViewer = ({ fileUrl, initialLabels = [] }: UsePdfViewerProps): UsePdfViewerReturn => {
  const [pdfUrl, setPdfUrl] = useState(fileUrl);
  const [labels, setLabels] = useState<Label[]>(initialLabels);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<{ type: string; color: string; icon: string; } | undefined>(undefined);
  const [loadKey, setLoadKey] = useState(0); // Used to force refresh

  // Process the fileUrl to determine if proxying is needed
  useEffect(() => {
    const processUrl = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if URL needs to be proxied
        if (fileUrl && fileUrl.startsWith('http')) {
          // Handle BackBlaze URLs specially
          if (fileUrl.includes('backblazeb2.com')) {
            console.log('Using B2 endpoint for BackBlaze URL');
            setPdfUrl(`/api/b2/download-pdf?url=${encodeURIComponent(fileUrl)}`);
          } else {
            // General proxy for other URLs
            console.log('Using general proxy for URL');
            setPdfUrl(`/api/proxy-pdf?url=${encodeURIComponent(fileUrl)}`);
          }
        } else {
          // Local file, use as is
          setPdfUrl(fileUrl);
        }
      } catch (err) {
        console.error('Error processing PDF URL:', err);
        setError('Failed to process PDF URL');
      } finally {
        setIsLoading(false);
      }
    };

    processUrl();
  }, [fileUrl, loadKey]);

  // Initialize labels
  useEffect(() => {
    setLabels(initialLabels);
  }, [initialLabels]);

  // Handle label changes
  const handleLabelsChange = useCallback((newLabels: Label[]) => {
    setLabels(newLabels);
  }, []);

  // Clear any error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reload the PDF
  const reloadPdf = useCallback(() => {
    setLoadKey(prev => prev + 1);
  }, []);

  return {
    pdfUrl,
    labels,
    isLoading,
    error,
    selectedLabel,
    setSelectedLabel,
    handleLabelsChange,
    clearError,
    reloadPdf
  };
};

export default usePdfViewer; 