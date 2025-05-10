'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Rnd } from 'react-rnd';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { SignatureCanvas } from './SignatureCanvas';

// Import styles
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf-worker/pdf.worker.min.js`;

// Field types
export type FieldType = 'text' | 'signature' | 'date' | 'checkbox';

// Field definition
export interface Field {
  id: string;
  type: FieldType;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
}

interface PDFEditorProps {
  pdfFile: string | File | ArrayBuffer;
  onSave?: (fields: Field[]) => void;
  initialFields?: Field[];
  className?: string;
}

export function PDFEditor({
  pdfFile,
  onSave,
  initialFields = [],
  className = '',
}: PDFEditorProps) {
  // State
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(600);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [selectedFieldType, setSelectedFieldType] = useState<FieldType>('text');
  const [scale, setScale] = useState<number>(1);
  const [isAddingField, setIsAddingField] = useState<boolean>(false);
  const [activeSignatureField, setActiveSignatureField] = useState<Field | null>(null);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    
    // Reset page refs array
    pageRefs.current = Array(numPages).fill(null);
    
    // Adjust container width based on available space
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      setPageWidth(Math.min(containerWidth - 40, 800)); // Max width of 800px
    }
  };

  // Add a new field
  const addField = (pageNumber: number, position: { x: number, y: number }) => {
    const pageRef = pageRefs.current[pageNumber - 1];
    if (!pageRef) return;
    
    const pageRect = pageRef.getBoundingClientRect();
    const pageHeight = pageRect.height;
    
    // Calculate relative position
    const relX = position.x / pageWidth;
    const relY = position.y / pageHeight;
    
    // Default sizes (relative to page dimensions)
    const defaultWidths: Record<FieldType, number> = {
      text: 0.3,
      signature: 0.2,
      date: 0.15,
      checkbox: 0.05
    };
    
    const defaultHeights: Record<FieldType, number> = {
      text: 0.05,
      signature: 0.1,
      date: 0.05,
      checkbox: 0.05
    };
    
    const newField: Field = {
      id: uuidv4(),
      type: selectedFieldType,
      page: pageNumber,
      x: relX,
      y: relY,
      width: defaultWidths[selectedFieldType],
      height: defaultHeights[selectedFieldType],
      value: '',
    };
    
    setFields((prevFields) => [...prevFields, newField]);
    setIsAddingField(false);
  };

  // Update field position and size
  const updateField = (updatedField: Field) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === updatedField.id ? updatedField : field
      )
    );
  };

  // Delete a field
  const deleteField = (fieldId: string) => {
    setFields((prevFields) => prevFields.filter((field) => field.id !== fieldId));
  };

  // Handle page click for adding fields
  const handlePageClick = (e: React.MouseEvent, pageNumber: number) => {
    if (!isAddingField) return;
    
    const pageRef = pageRefs.current[pageNumber - 1];
    if (!pageRef) return;
    
    const pageRect = pageRef.getBoundingClientRect();
    const x = e.clientX - pageRect.left;
    const y = e.clientY - pageRect.top;
    
    addField(pageNumber, { x, y });
  };

  // Save fields
  const handleSave = () => {
    if (onSave) {
      onSave(fields);
    }
  };

  // Render field based on type
  const renderFieldContent = (field: Field) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            className="w-full h-full border border-blue-400 bg-white/80 px-2 focus:outline-none focus:border-blue-600"
            value={field.value}
            onChange={(e) => updateField({ ...field, value: e.target.value })}
            placeholder="Text field"
          />
        );
      case 'signature':
        return (
          <Dialog>
            <DialogTrigger asChild>
              <div 
                className="w-full h-full border border-green-400 bg-white/80 flex items-center justify-center text-sm text-gray-500 cursor-pointer"
                onClick={() => setActiveSignatureField(field)}
              >
                {field.value ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <img src={field.value} alt="Signature" className="max-w-full max-h-full" />
                  </div>
                ) : (
                  <span>Click to sign</span>
                )}
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <SignatureCanvas 
                onSave={(signatureDataUrl) => {
                  updateField({ ...field, value: signatureDataUrl });
                }}
                onCancel={() => {}}
              />
            </DialogContent>
          </Dialog>
        );
      case 'date':
        return (
          <input
            type="date"
            className="w-full h-full border border-purple-400 bg-white/80 px-2 focus:outline-none focus:border-purple-600"
            value={field.value}
            onChange={(e) => updateField({ ...field, value: e.target.value })}
          />
        );
      case 'checkbox':
        return (
          <div className="w-full h-full border border-orange-400 bg-white/80 flex items-center justify-center">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={field.value === 'true'}
              onChange={(e) => updateField({ ...field, value: e.target.checked ? 'true' : 'false' })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="bg-gray-100 p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={isAddingField ? "default" : "outline"}
              onClick={() => setIsAddingField(!isAddingField)}
            >
              {isAddingField ? 'Cancel' : 'Add Field'}
            </Button>
            
            {isAddingField && (
              <Tabs defaultValue="text" onValueChange={(value) => setSelectedFieldType(value as FieldType)}>
                <TabsList>
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="signature">Signature</TabsTrigger>
                  <TabsTrigger value="date">Date</TabsTrigger>
                  <TabsTrigger value="checkbox">Checkbox</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setScale(Math.max(0.5, scale - 0.1))}>
              Zoom Out
            </Button>
            <span className="text-sm">{Math.round(scale * 100)}%</span>
            <Button variant="outline" onClick={() => setScale(Math.min(2, scale + 0.1))}>
              Zoom In
            </Button>
            <Button variant="default" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
        
        {numPages && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span>
              Page {currentPage} of {numPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage >= (numPages || 1)}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
      
      <div 
        ref={containerRef} 
        className="flex-1 overflow-auto bg-gray-200 p-5 flex justify-center"
      >
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex flex-col items-center"
        >
          {Array.from(new Array(numPages), (el, index) => {
            const pageNumber = index + 1;
            const pageHeight = pageWidth * 1.414; // Approximate A4 ratio
            
            return (
              <div
                key={`page_${pageNumber}`}
                ref={(el: HTMLDivElement | null) => {
                  pageRefs.current[index] = el;
                }}
                className="relative mb-5 shadow-lg"
                style={{
                  width: pageWidth * scale,
                  height: pageHeight * scale,
                }}
                onClick={(e) => handlePageClick(e, pageNumber)}
              >
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth * scale}
                  className="bg-white"
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
                
                {/* Render fields for this page */}
                {fields
                  .filter((field) => field.page === pageNumber)
                  .map((field) => {
                    // Calculate absolute position and size
                    const x = field.x * pageWidth * scale;
                    const y = field.y * pageHeight * scale;
                    const width = field.width * pageWidth * scale;
                    const height = field.height * pageHeight * scale;
                    
                    return (
                      <Rnd
                        key={field.id}
                        position={{ x, y }}
                        size={{ width, height }}
                        onDragStop={(e, d) => {
                          // Convert back to relative coordinates
                          const newX = d.x / (pageWidth * scale);
                          const newY = d.y / (pageHeight * scale);
                          updateField({ ...field, x: newX, y: newY });
                        }}
                        onResizeStop={(e, direction, ref, delta, position) => {
                          // Convert back to relative coordinates
                          const newWidth = ref.offsetWidth / (pageWidth * scale);
                          const newHeight = ref.offsetHeight / (pageHeight * scale);
                          const newX = position.x / (pageWidth * scale);
                          const newY = position.y / (pageHeight * scale);
                          
                          updateField({
                            ...field,
                            x: newX,
                            y: newY,
                            width: newWidth,
                            height: newHeight,
                          });
                        }}
                        bounds="parent"
                        className="bg-white/80 shadow-md"
                      >
                        <div className="relative w-full h-full">
                          {renderFieldContent(field)}
                          <button
                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteField(field.id);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </Rnd>
                    );
                  })}
              </div>
            );
          })}
        </Document>
      </div>
    </div>
  );
} 