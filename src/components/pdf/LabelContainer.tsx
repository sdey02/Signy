import React, { useRef, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LabelOverlay, Label } from './LabelOverlay';

interface LabelContainerProps {
  pageNumber: number;
  scale: number;
  onLabelsChange: (labels: Label[]) => void;
  selectedLabel?: { type?: string; color?: string; icon: string };
  existingLabels?: Label[];
}

export function LabelContainer({
  pageNumber,
  scale,
  onLabelsChange,
  selectedLabel,
  existingLabels = [],
}: LabelContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLabelPlacementMode, setIsLabelPlacementMode] = useState(false);
  const lastAddedTypeRef = useRef<string | null>(null);

  /* Load stored labels for the current page */
  useEffect(() => {
    setLabels(existingLabels.filter(l => l.pageNumber === pageNumber));
  }, [pageNumber, existingLabels]);

  /* Enter label placement mode when a label type is selected */
  useEffect(() => {
    console.log("Selected label changed:", selectedLabel);
    if (selectedLabel?.type) {
      console.log("Entering label placement mode");
      setIsLabelPlacementMode(true);
      lastAddedTypeRef.current = null; // Reset so we can add multiple of the same type
    } else {
      console.log("Exiting label placement mode");
      setIsLabelPlacementMode(false);
    }
  }, [selectedLabel]);

  /* Handle clicking on the container to place a new label */
  const handleContainerClick = (e: React.MouseEvent) => {
    console.log("Container clicked");
    console.log("isLabelPlacementMode:", isLabelPlacementMode);
    console.log("selectedLabel:", selectedLabel);
    console.log("containerRef exists:", !!containerRef.current);
    
    if (!isLabelPlacementMode || !selectedLabel?.type || !containerRef.current) {
      console.log("Returning early from click handler");
      return;
    }

    // Prevent event from propagating to PDF viewer
    e.stopPropagation();
    e.preventDefault();
    
    // Get click position relative to container
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - containerRect.left) / scale;
    const y = (e.clientY - containerRect.top) / scale;
    
    console.log("Creating new label at position:", { x, y });

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

    console.log("New label created:", newLabel);

    const updated = [...labels, newLabel];
    setLabels(updated);
    onLabelsChange([
      ...existingLabels.filter(l => l.pageNumber !== pageNumber),
      ...updated,
    ]);

    // Exit placement mode
    lastAddedTypeRef.current = selectedLabel.type;
    setIsLabelPlacementMode(false);
  };

  /* helpers for <LabelOverlay> */
  const updatePosition = (id: string, x: number, y: number) =>
    setLabels(prev => {
      const next = prev.map(l => (l.id === id ? { ...l, x, y } : l));
      onLabelsChange([
        ...existingLabels.filter(l => l.pageNumber !== pageNumber),
        ...next,
      ]);
      return next;
    });

  const updateSize = (id: string, width: number, height: number) =>
    setLabels(prev => {
      const next = prev.map(l => (l.id === id ? { ...l, width, height } : l));
      onLabelsChange([
        ...existingLabels.filter(l => l.pageNumber !== pageNumber),
        ...next,
      ]);
      return next;
    });

  const updateText = (id: string, text: string) =>
    setLabels(prev => {
      const next = prev.map(l => (l.id === id ? { ...l, text } : l));
      onLabelsChange([
        ...existingLabels.filter(l => l.pageNumber !== pageNumber),
        ...next,
      ]);
      return next;
    });

  console.log("Rendering LabelContainer, isLabelPlacementMode:", isLabelPlacementMode);
  console.log("Currently have", labels.length, "labels on page", pageNumber);

  /* ---------------- render ---------------- */
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-auto"
      onClick={handleContainerClick}
      style={{
        /* Match the viewer's zoom so overlays sit directly on top of the page */
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        cursor: isLabelPlacementMode ? 'crosshair' : 'default',
      }}
    >
      {/* Debug button to test label placement */}
      {isLabelPlacementMode && (
        <button
          className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded z-[9999]"
          style={{ transform: 'scale(1)' }}
          onClick={(e) => {
            e.stopPropagation();
            if (!selectedLabel?.type || !containerRef.current) return;
            
            // Create new label at a fixed position
            const newLabel: Label = {
              id: uuidv4(),
              type: selectedLabel.type.toLowerCase(),
              text: 'Debug Label',
              x: 100,
              y: 100,
              width: 200,
              height: 100,
              color: selectedLabel.color,
              icon: selectedLabel.icon,
              pageNumber,
            };

            console.log("Debug label created:", newLabel);

            const updated = [...labels, newLabel];
            setLabels(updated);
            onLabelsChange([
              ...existingLabels.filter(l => l.pageNumber !== pageNumber),
              ...updated,
            ]);
          }}
        >
          Add Debug Label
        </button>
      )}

      {isLabelPlacementMode && (
        <div 
          className="absolute inset-0 bg-blue-500 bg-opacity-20 pointer-events-none" 
          style={{ zIndex: 999 }}
        />
      )}

      {labels.map(label => (
        <LabelOverlay
          key={label.id}
          label={label}
          containerRef={containerRef}
          onPositionChange={updatePosition}
          onSizeChange={updateSize}
          onTextChange={updateText}
          scale={scale}
        />
      ))}
    </div>
  );
}
