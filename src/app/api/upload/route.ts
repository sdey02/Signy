import { NextRequest, NextResponse } from 'next/server';
import B2 from 'backblaze-b2';
import { createClient } from '@supabase/supabase-js';

// Configure the API route to handle larger file uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '200mb',
  },
};

const b2 = new B2({
  applicationKeyId: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY_ID!,
  applicationKey: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY!,
});

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for admin operations
  {
    auth: {
      persistSession: false,
    }
  }
);

// This must be dynamic as it handles file uploads
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Initialize B2 client
    await b2.authorize();
    
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'No user ID provided' },
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

    // Get upload URL
    const { data: { uploadUrl, authorizationToken } } = await b2.getUploadUrl({
      bucketId: process.env.NEXT_PUBLIC_B2_BUCKET_ID!
    });

    // Create unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storagePath = `documents/${userId}/${uniqueFileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to B2
    const uploadResponse = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: storagePath,
      data: buffer,
    });

    // Generate public URL
    const bucketName = process.env.NEXT_PUBLIC_B2_BUCKET_NAME!;
    const fileUrl = `https://f004.backblazeb2.com/file/${bucketName}/${storagePath}`;

    // Store file metadata in Supabase
    const { data: fileMetadata, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || 'application/octet-stream',
        b2_file_id: uploadResponse.data.fileId,
        file_url: fileUrl,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to store file metadata');
    }

    // Return success response
    return NextResponse.json({
      success: true,
      ...fileMetadata,
      message: 'File uploaded successfully'
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 