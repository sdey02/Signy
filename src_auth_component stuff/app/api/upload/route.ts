import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../lib/auth';
import { B2Client } from '../../../lib/backblaze';
import { DocumentService } from '../../../lib/documents';

// Configure the API route to handle larger file uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '200mb',
  },
};

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user ID
    const authService = AuthService.getInstance();
    const userId = await authService.getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    // Initialize B2 client
    const b2Client = B2Client.getInstance();
    await b2Client.initialize();

    // Process file upload
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Check file size (200MB limit)
    const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds limit (${Math.round(file.size / (1024 * 1024))}MB > ${MAX_FILE_SIZE / (1024 * 1024)}MB)` },
        { status: 413 }
      );
    }
    
    console.log('Upload API: Processing file:', file.name, `(${file.size} bytes)`);
    
    // Upload file to B2
    const { fileUrl, fileId, storagePath } = await b2Client.uploadFile({
      file,
      userId,
      onProgress: (progress) => {
        console.log(`Upload progress: ${progress}%`);
      }
    });
    
    console.log('Upload API: File uploaded successfully to B2:', storagePath);
    
    // Store document metadata
    const documentService = DocumentService.getInstance();
    await documentService.storeMetadata({
      user_id: userId,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type || 'application/pdf',
      file_url: fileUrl,
      b2_file_id: fileId,
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      message: 'File uploaded successfully'
    });
    
  } catch (error: any) {
    console.error('Upload API: Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 