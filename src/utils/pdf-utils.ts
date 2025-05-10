import { PDFDocument, rgb, StandardFonts, PDFPage, RGB } from 'pdf-lib';
import { Field } from '@/components/pdf-editor/PDFEditor';

/**
 * Embeds field values into a PDF document
 * @param pdfBytes The original PDF as an ArrayBuffer
 * @param fields The fields to embed
 * @returns A Promise that resolves to the modified PDF as an ArrayBuffer
 */
export async function embedFieldsIntoPdf(
  pdfBytes: ArrayBuffer,
  fields: Field[]
): Promise<ArrayBuffer> {
  // Load the PDF document
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  // Get the font
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Process each field
  for (const field of fields) {
    const page = pdfDoc.getPage(field.page - 1);
    const { width, height } = page.getSize();
    
    // Calculate absolute positions
    const x = field.x * width;
    const y = height - (field.y * height) - (field.height * height); // PDF coordinates start from bottom-left
    const fieldWidth = field.width * width;
    const fieldHeight = field.height * height;
    
    switch (field.type) {
      case 'text':
        // Draw text field
        page.drawText(field.value, {
          x: x + 2, // Small padding
          y: y + fieldHeight / 2 - 6, // Center text vertically
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        
        // Draw border
        drawRectangle(page, x, y, fieldWidth, fieldHeight, rgb(0.8, 0.8, 0.8));
        break;
        
      case 'signature':
        // If there's a signature (as a data URL), try to embed it
        if (field.value && field.value.startsWith('data:image')) {
          try {
            // Extract base64 data from data URL
            const base64Data = field.value.split(',')[1];
            let imageBytes: Uint8Array;
            
            // Convert base64 to Uint8Array
            if (typeof Buffer !== 'undefined') {
              // Node.js environment
              imageBytes = Buffer.from(base64Data, 'base64');
            } else {
              // Browser environment - manual conversion
              const binaryString = atob(base64Data);
              imageBytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                imageBytes[i] = binaryString.charCodeAt(i);
              }
            }
            
            // Embed the image
            let pdfImage;
            if (field.value.includes('image/png')) {
              pdfImage = await pdfDoc.embedPng(imageBytes);
            } else if (field.value.includes('image/jpeg')) {
              pdfImage = await pdfDoc.embedJpg(imageBytes);
            } else {
              // Default to PNG if type is unknown
              pdfImage = await pdfDoc.embedPng(imageBytes);
            }
            
            // Draw the image
            page.drawImage(pdfImage, {
              x,
              y,
              width: fieldWidth,
              height: fieldHeight,
            });
          } catch (error) {
            console.error('Error embedding signature image:', error);
            // Draw a placeholder if image embedding fails
            drawRectangle(page, x, y, fieldWidth, fieldHeight, rgb(0.9, 0.9, 0.9));
            page.drawText('Signature', {
              x: x + 5,
              y: y + fieldHeight / 2 - 6,
              size: 10,
              font: helveticaFont,
              color: rgb(0.5, 0.5, 0.5),
            });
          }
        } else {
          // Draw an empty signature field
          drawRectangle(page, x, y, fieldWidth, fieldHeight, rgb(0.9, 0.9, 0.9));
        }
        break;
        
      case 'date':
        // Draw date field
        page.drawText(field.value || 'MM/DD/YYYY', {
          x: x + 2,
          y: y + fieldHeight / 2 - 6,
          size: 10,
          font: helveticaFont,
          color: field.value ? rgb(0, 0, 0) : rgb(0.7, 0.7, 0.7),
        });
        
        // Draw border
        drawRectangle(page, x, y, fieldWidth, fieldHeight, rgb(0.8, 0.8, 0.8));
        break;
        
      case 'checkbox':
        // Draw checkbox
        drawRectangle(page, x, y, fieldWidth, fieldHeight, rgb(0.9, 0.9, 0.9));
        
        // If checked, draw an X
        if (field.value === 'true') {
          // Draw an X
          const padding = 2;
          
          // Draw first line of X
          page.drawLine({
            start: { x: x + padding, y: y + padding },
            end: { x: x + fieldWidth - padding, y: y + fieldHeight - padding },
            thickness: 2,
            color: rgb(0, 0, 0),
          });
          
          // Draw second line of X
          page.drawLine({
            start: { x: x + padding, y: y + fieldHeight - padding },
            end: { x: x + fieldWidth - padding, y: y + padding },
            thickness: 2,
            color: rgb(0, 0, 0),
          });
        }
        break;
    }
  }
  
  // Save the modified PDF
  const modifiedPdfBytes = await pdfDoc.save();
  
  return modifiedPdfBytes.buffer;
}

/**
 * Helper function to draw a rectangle on a PDF page
 */
function drawRectangle(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  color: RGB,
  borderWidth = 1
) {
  // Draw the border as four lines
  // Bottom line
  page.drawLine({
    start: { x: x, y: y },
    end: { x: x + width, y: y },
    thickness: borderWidth,
    color: color
  });
  
  // Right line
  page.drawLine({
    start: { x: x + width, y: y },
    end: { x: x + width, y: y + height },
    thickness: borderWidth,
    color: color
  });
  
  // Top line
  page.drawLine({
    start: { x: x + width, y: y + height },
    end: { x: x, y: y + height },
    thickness: borderWidth,
    color: color
  });
  
  // Left line
  page.drawLine({
    start: { x: x, y: y + height },
    end: { x: x, y: y },
    thickness: borderWidth,
    color: color
  });
}

/**
 * Utilities for PDF loading, validation, and error handling
 */

/**
 * Check if a URL is a BackBlaze B2 URL
 */
export const isBackBlazeUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('backblazeb2.com');
};

/**
 * Get the appropriate URL for loading a PDF
 * This handles proxying through our API endpoints for external PDFs
 */
export const getPdfProxyUrl = (url: string): string => {
  if (!url) return '';
  
  // If it's not an external URL, return as is
  if (!url.startsWith('http')) return url;
  
  // For BackBlaze URLs, use specialized endpoint
  if (isBackBlazeUrl(url)) {
    return `/api/b2/download-pdf?url=${encodeURIComponent(url)}`;
  }
  
  // For all other external URLs, use general proxy
  return `/api/proxy-pdf?url=${encodeURIComponent(url)}`;
};

/**
 * Check if a local blob is a valid PDF
 * Returns true if valid, false if not
 */
export const validatePdfBlob = async (blob: Blob): Promise<boolean> => {
  try {
    // Check the magic number for PDFs
    // PDFs start with %PDF
    const pdfMagicNumber = [0x25, 0x50, 0x44, 0x46]; // %PDF
    
    const buffer = await blob.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Check if the first 4 bytes match %PDF
    return bytes[0] === pdfMagicNumber[0] &&
           bytes[1] === pdfMagicNumber[1] &&
           bytes[2] === pdfMagicNumber[2] &&
           bytes[3] === pdfMagicNumber[3];
  } catch (error) {
    console.error('Error validating PDF blob:', error);
    return false;
  }
};

/**
 * Get a human-readable error message for PDF loading errors
 */
export const getPdfErrorMessage = (error: any): string => {
  if (!error) return 'Unknown error loading PDF';
  
  // If error is a string, return it
  if (typeof error === 'string') return error;
  
  // If error has a message property, return that
  if (error.message) return error.message;
  
  // For network errors
  if (error.status === 401 || error.status === 403) {
    return 'Authentication error: You do not have permission to view this PDF';
  }
  
  if (error.status === 404) {
    return 'PDF file not found';
  }
  
  if (error.status >= 500) {
    return 'Server error while loading PDF';
  }
  
  if (error.name === 'InvalidPDFException') {
    return 'Invalid PDF file format';
  }
  
  // If we can't determine a specific error, return a generic message
  return 'Error loading PDF: ' + String(error);
}; 