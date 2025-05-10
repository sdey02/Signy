'use client';

import { useState } from 'react';
import { PDFEditor, Field } from '@/components/pdf-editor/PDFEditor';
import { Button } from '@/components/ui/button';
import { embedFieldsIntoPdf } from '@/utils/pdf-embed';

export default function PDFEditorPage() {
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPdfFile(fileUrl);
    }
  };
  
  // Handle save
  const handleSave = (savedFields: Field[]) => {
    setFields(savedFields);
    console.log('Fields saved:', savedFields);
  };
  
  // Handle download
  const handleDownload = async () => {
    if (!pdfFile || fields.length === 0) {
      alert('Please upload a PDF and add some fields first.');
      return;
    }
    
    try {
      // Fetch the PDF file
      const response = await fetch(pdfFile);
      const pdfBytes = await response.arrayBuffer();
      
      // Embed fields into the PDF
      const modifiedPdfBytes = await embedFieldsIntoPdf(pdfBytes, fields);
      
      // Create a download link
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and click it
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document-with-fields.pdf';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">PDF Editor</h1>
      
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          
          {fields.length > 0 && (
            <Button onClick={handleDownload}>
              Download PDF with Fields
            </Button>
          )}
        </div>
      </div>
      
      {pdfFile ? (
        <div className="border rounded-lg overflow-hidden">
          <PDFEditor
            pdfFile={pdfFile}
            onSave={handleSave}
            className="h-[calc(100vh-200px)]"
          />
        </div>
      ) : (
        <div className="border rounded-lg p-10 text-center bg-gray-50">
          <p className="text-gray-500">Please upload a PDF file to start editing.</p>
        </div>
      )}
    </div>
  );
} 