'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface SignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
}

export function SignatureDialog({ isOpen, onClose, onSave }: SignatureDialogProps) {
  const [activeTab, setActiveTab] = useState('draw');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [typedSignature, setTypedSignature] = useState('');
  const [selectedFont, setSelectedFont] = useState('font-dancing');
  
  // Initialize canvas when the component mounts
  useEffect(() => {
    if (!isOpen) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Set up context
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.strokeStyle = '#000000';
    
    // Clear canvas
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    setCtx(context);
  }, [isOpen]);
  
  // Handle mouse/touch events for drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ctx) return;
    
    setIsDrawing(true);
    
    // Get position
    const position = getEventPosition(e);
    
    // Start path
    ctx.beginPath();
    ctx.moveTo(position.x, position.y);
  };
  
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return;
    
    // Prevent scrolling on touch devices
    e.preventDefault();
    
    // Get position
    const position = getEventPosition(e);
    
    // Draw line
    ctx.lineTo(position.x, position.y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    if (!ctx) return;
    
    setIsDrawing(false);
    ctx.closePath();
  };
  
  // Get position from mouse or touch event
  const getEventPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      // Touch event
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };
  
  // Clear canvas
  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };
  
  // Save signature
  const handleSaveSignature = () => {
    if (activeTab === 'draw') {
      if (!canvasRef.current) return;
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSave(dataUrl);
    } else if (activeTab === 'type') {
      if (!typedSignature.trim()) {
        alert('Please enter your signature');
        return;
      }
      
      // Create a temporary canvas to render the typed signature
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 300;
      tempCanvas.height = 100;
      
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      // Fill white background
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Draw text
      tempCtx.font = `30px ${selectedFont === 'font-dancing' ? 'cursive' : 'serif'}`;
      tempCtx.fillStyle = '#000000';
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';
      tempCtx.fillText(typedSignature, tempCanvas.width / 2, tempCanvas.height / 2);
      
      // Get data URL
      const dataUrl = tempCanvas.toDataURL('image/png');
      onSave(dataUrl);
    }
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Your Signature</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="draw" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="draw" className="flex-1">Draw</TabsTrigger>
            <TabsTrigger value="type" className="flex-1">Type</TabsTrigger>
          </TabsList>
          
          <TabsContent value="draw" className="mt-4">
            <div className="border border-gray-300 rounded mb-4 bg-white">
              <canvas
                ref={canvasRef}
                className="w-full h-40 cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <Button variant="outline" size="sm" onClick={clearCanvas} className="mb-2">
              Clear
            </Button>
          </TabsContent>
          
          <TabsContent value="type" className="mt-4">
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Type your signature"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
              />
              
              <div className="flex gap-2">
                <Button
                  variant={selectedFont === 'font-dancing' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFont('font-dancing')}
                  className="flex-1"
                >
                  <span style={{ fontFamily: 'cursive' }}>Signature</span>
                </Button>
                <Button
                  variant={selectedFont === 'font-serif' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFont('font-serif')}
                  className="flex-1"
                >
                  <span style={{ fontFamily: 'serif' }}>Signature</span>
                </Button>
              </div>
              
              <div className="p-4 border border-gray-300 rounded bg-white min-h-20 flex items-center justify-center">
                {typedSignature ? (
                  <span style={{ 
                    fontSize: '1.5rem', 
                    fontFamily: selectedFont === 'font-dancing' ? 'cursive' : 'serif' 
                  }}>
                    {typedSignature}
                  </span>
                ) : (
                  <span className="text-gray-400">Your signature will appear here</span>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveSignature}>
            Save Signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 