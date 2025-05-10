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
            // For signatures, we'll just draw a placeholder for now
            // In a production app, you would properly embed the image
            drawRectangle(page, x, y, fieldWidth, fieldHeight, rgb(0.9, 0.9, 0.9));
            page.drawText('Signature', {
              x: x + 5,
              y: y + fieldHeight / 2 - 6,
              size: 10,
              font: helveticaFont,
              color: rgb(0.5, 0.5, 0.5),
            });
          } catch (error) {
            console.error('Error handling signature:', error);
            // Draw a placeholder if there's an error
            drawRectangle(page, x, y, fieldWidth, fieldHeight, rgb(0.9, 0.9, 0.9));
            page.drawText('Signature Error', {
              x: x + 5,
              y: y + fieldHeight / 2 - 6,
              size: 10,
              font: helveticaFont,
              color: rgb(0.7, 0.3, 0.3),
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
  page.drawLine({
    start: { x, y },
    end: { x + width, y },
    thickness: borderWidth,
    color,
  });
  
  page.drawLine({
    start: { x + width, y },
    end: { x + width, y + height },
    thickness: borderWidth,
    color,
  });
  
  page.drawLine({
    start: { x + width, y + height },
    end: { x, y + height },
    thickness: borderWidth,
    color,
  });
  
  page.drawLine({
    start: { x, y + height },
    end: { x, y },
    thickness: borderWidth,
    color,
  });
} 