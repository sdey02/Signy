import { NextRequest, NextResponse } from 'next/server';
import B2 from 'backblaze-b2';
import { createClient } from '@supabase/supabase-js';

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

export async function POST(request: NextRequest) {
  try {
    const { fileId, fileName, userId } = await request.json();

    if (!fileId || !fileName || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Initialize B2 client
    await b2.authorize();

    // Get the file info first to get the correct file name
    const { data: fileInfo } = await b2.getFileInfo({
      fileId,
    });

    if (!fileInfo) {
      throw new Error('File not found in B2');
    }

    // Delete file from B2
    await b2.deleteFileVersion({
      fileId,
      fileName: fileInfo.fileName, // Use the full path from B2's file info
    });

    // Delete file metadata from Supabase
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .match({ b2_file_id: fileId, user_id: userId });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to delete file metadata');
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 