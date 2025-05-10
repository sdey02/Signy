import React, { useRef, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LabelOverlay, Label } from './LabelOverlay';

interface LabelContainerProps {
  pageNumber: number;
  scale: number;
  onLabelsChange: (labels: Label[]) => void;
  selectedLabel?: { type?: string; color?: string; icon: string };
  existingLabels?: Label[];
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function LabelContainer({
  pageNumber,
  scale,
  onLabelsChange,
  selectedLabel,
  existingLabels = [],
  containerRef: externalContainerRef,
}: LabelContainerProps) {
  const localContainerRef = useRef<HTMLDivElement>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLabelPlacementMode, setIsLabelPlacementMode] = useState(false);
  const lastAddedTypeRef = useRef<string | null>(null);
  
  // Use the external container ref if provided, otherwise use the local one
  const effectiveContainerRef = externalContainerRef || localContainerRef;

  // Load stored labels for the current page
  useEffect(() => {
    const filteredLabels = existingLabels.filter(l => l.pageNumber === pageNumber);
    setLabels(filteredLabels);
  }, [pageNumber, existingLabels]);

  // Handle label type changes
  useEffect(() => {
    if (selectedLabel?.type) {
      setIsLabelPlacementMode(true);
      lastAddedTypeRef.current = null; // Reset so we can add multiple of the same type
    } else {
      setIsLabelPlacementMode(false);
    }
  }, [selectedLabel]);

  // Update parent component with label changes
  const updateParentLabels = useCallback((updatedPageLabels: Label[]) => {
    const labelsForOtherPages = existingLabels.filter(l => l.pageNumber !== pageNumber);
    onLabelsChange([...labelsForOtherPages, ...updatedPageLabels]);
  }, [existingLabels, pageNumber, onLabelsChange]);

  // Handle clicking on the container to place a new label
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (!isLabelPlacementMode || !selectedLabel?.type || !effectiveContainerRef.current) {
      return;
    }

    // Prevent event from propagating to PDF viewer
    e.stopPropagation();
    e.preventDefault();
    
    // Get click position relative to container
    const containerRect = effectiveContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - containerRect.left) / scale;
    const y = (e.clientY - containerRect.top) / scale;

    // Create new label at click position
    const newLabel: Label = {
      id: uuidv4(),
      type: selectedLabel.type.toLowerCase(),
      text: '',
      x,
      y,
      width: 200,
      height: 100,
      color: selectedLabel.color,
      icon: selectedLabel.icon,
      pageNumber,
    };

    const updatedLabels = [...labels, newLabel];
    
    // Update local state
    setLabels(updatedLabels);
    
    // Update parent state with all labels
    updateParentLabels(updatedLabels);

    // Exit placement mode after placing a label
    lastAddedTypeRef.current = selectedLabel.type;
    setIsLabelPlacementMode(false);
  }, [isLabelPlacementMode, selectedLabel, effectiveContainerRef, scale, labels, pageNumber, updateParentLabels]);

  /* helpers for <LabelOverlay> */
  const updatePosition = useCallback((id: string, x: number, y: number) => {
    setLabels(prev => {
      const next = prev.map(l => (l.id === id ? { ...l, x, y } : l));
      
      // Update parent with all labels including the updated one
      updateParentLabels(next);
      
      return next;
    });
  }, [updateParentLabels]);

  const updateSize = useCallback((id: string, width: number, height: number) => {
    setLabels(prev => {
      const next = prev.map(l => (l.id === id ? { ...l, width, height } : l));
      
      // Update parent with all labels including the updated one
      updateParentLabels(next);
      
      return next;
    });
  }, [updateParentLabels]);

  const updateText = useCallback((id: string, text: string) => {
    setLabels(prev => {
      const next = prev.map(l => (l.id === id ? { ...l, text } : l));
      
      // Update parent with all labels including the updated one
      updateParentLabels(next);
      
      return next;
    });
  }, [updateParentLabels]);

  return (
    <div
      ref={localContainerRef}
      className="absolute inset-0"
      style={{
        /* Match the viewer's zoom so overlays sit directly on top of the page */
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        cursor: isLabelPlacementMode ? 'crosshair' : 'default',
        pointerEvents: isLabelPlacementMode ? 'auto' : 'none',
        zIndex: 999,
      }}
    >
      {/* Clickable overlay for placing labels */}
      {isLabelPlacementMode && (
        <div 
          className="absolute inset-0 bg-blue-500 bg-opacity-20"
          onClick={handleContainerClick}
          style={{ 
            pointerEvents: 'auto',
            zIndex: 999 
          }}
        />
      )}

      {/* Render all labels for this page */}
      {labels.map(label => (
        <LabelOverlay
          key={label.id}
          label={label}
          containerRef={effectiveContainerRef}
          onPositionChange={updatePosition}
          onSizeChange={updateSize}
          onTextChange={updateText}
          scale={scale}
        />
      ))}
    </div>
  );
}
