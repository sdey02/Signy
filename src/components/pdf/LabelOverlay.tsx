import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { SignatureDialog } from './SignatureDialog';

export interface Label {
  id: string;
  type: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;          // colour is now optional
  icon: string;
  pageNumber: number;
}

interface LabelOverlayProps {
  label: Label;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSizeChange: (id: string, width: number, height: number) => void;
  onTextChange?: (id: string, text: string) => void;
  scale?: number;
}

export function LabelOverlay({
  label,
  containerRef,
  onPositionChange,
  onSizeChange,
  onTextChange,
  scale = 1,
}: LabelOverlayProps) {
  const [isActive, setIsActive] = useState(false);
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
  const rndRef = useRef<Rnd>(null);
  
  /* Fallback to a sensible colour if none supplied */
  const safeColour = label.color ?? '#3b82f6'; // tailwind "blue-500"

  // Reset active state when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rndRef.current && !rndRef.current.resizableElement.current?.contains(e.target as Node)) {
        setIsActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActive(true);
  }, []);

  const handleSignatureClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsSignatureDialogOpen(true);
  }, []);

  const handleSignatureSave = useCallback((signatureDataUrl: string) => {
    if (onTextChange) {
      onTextChange(label.id, signatureDataUrl);
    }
    setIsSignatureDialogOpen(false);
  }, [label.id, onTextChange]);

  return (
    <>
      <Rnd
        ref={rndRef}
        bounds="parent"
        position={{ x: label.x, y: label.y }}
        size={{ width: label.width, height: label.height }}
        scale={scale}
        onDragStart={(e) => {
          e.stopPropagation();
          setIsActive(true);
        }}
        onDragStop={(e, d) => {
          onPositionChange(label.id, d.x, d.y);
        }}
        onResizeStart={(e) => {
          e.stopPropagation();
          setIsActive(true);
        }}
        onResizeStop={(_, __, ref, ___, pos) => {
          onSizeChange(label.id, ref.offsetWidth, ref.offsetHeight);
          onPositionChange(label.id, pos.x, pos.y);
        }}
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${safeColour}33`,  // 20% opacity
          border: `2px solid ${isActive ? safeColour : `${safeColour}99`}`,
          borderRadius: 4,
          zIndex: isActive ? 1001 : 1000,
          pointerEvents: 'auto',
        }}
        disableDragging={false}
        enableResizing={true}
      >
        <div 
          className="flex flex-col items-center justify-center w-full h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-2xl mb-1">{label.icon}</span>

          {label.type === 'signature' || label.type === 'initial' ? (
            label.text ? (
              // Display the signature image if it exists
              <div className="w-full h-full flex items-center justify-center p-2">
                <img 
                  src={label.text} 
                  alt={label.type} 
                  className="max-w-full max-h-full object-contain cursor-pointer"
                  onClick={handleSignatureClick}
                  onDragStart={(e) => e.preventDefault()} // Prevent image drag
                />
              </div>
            ) : (
              // Show "Click to sign" button if no signature yet
              <div 
                className="text-sm font-medium text-center px-2 py-1 bg-black/50 text-white rounded cursor-pointer hover:bg-black/70"
                onClick={handleSignatureClick}
              >
                Click to sign
              </div>
            )
          ) : (
            <input
              type="text"
              value={label.text}
              onChange={(e) => onTextChange?.(label.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-center bg-transparent border-none focus:outline-none text-black placeholder-black/50"
              placeholder={`Enter ${label.type}`}
            />
          )}
        </div>
      </Rnd>
      
      {/* Signature Dialog */}
      <SignatureDialog 
        isOpen={isSignatureDialogOpen}
        onClose={() => setIsSignatureDialogOpen(false)}
        onSave={handleSignatureSave}
      />
    </>
  );
}
