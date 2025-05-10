import { NextRequest, NextResponse } from 'next/server';
import B2 from 'backblaze-b2';

const b2 = new B2({
  applicationKeyId: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY_ID!,
  applicationKey: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY!,
});

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the file URL from query params
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }
    
    console.log(`B2 download request for: ${url}`);
    
    // Extract file info from URL
    // Example URL format: https://f004.backblazeb2.com/file/Orion-BackBlaze/documents/68076df7-fde2-4678-aad7-87abca8d403e/1741065230226-Ace_Your_Tech_Interview.pdf
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // The bucket name is the first part after /file/
    const bucketName = pathParts[2];
    
    // The file name is everything after the bucket name
    const fileName = pathParts.slice(3).join('/');
    
    console.log(`Extracted bucket: ${bucketName}, fileName: ${fileName}`);
    
    // Check that we have valid B2 credentials
    if (!process.env.NEXT_PUBLIC_B2_APPLICATION_KEY_ID || !process.env.NEXT_PUBLIC_B2_APPLICATION_KEY) {
      console.error('Missing B2 credentials in environment variables');
      return NextResponse.json({
        error: 'Server configuration error: Missing B2 credentials',
      }, { status: 500 });
    }
    
    try {
      // Authorize with B2
      console.log('Authorizing with B2...');
      await b2.authorize();
      console.log('B2 authorization successful');
      
      // Download the file from B2
      console.log(`Downloading file from B2: ${fileName}`);
      const response = await b2.downloadFileByName({
        bucketName,
        fileName,
        responseType: 'arraybuffer'
      });
      
      // Get the file data
      const fileBuffer = response.data;
      console.log(`Successfully downloaded file, size: ${fileBuffer.byteLength} bytes`);
      
      // Create a response with the PDF content and appropriate headers
      const headers = new Headers();
      headers.set('Content-Type', 'application/pdf');
      headers.set('Content-Length', fileBuffer.byteLength.toString());
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Cache-Control', 'public, max-age=3600');
      
      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      });
    } catch (b2Error: any) {
      console.error('B2 specific error:', b2Error);
      
      // Handle specific B2 errors
      if (b2Error.response?.status === 401 || b2Error.response?.status === 403) {
        return NextResponse.json({ 
          error: 'Authentication failed with BackBlaze B2',
          details: b2Error.message,
        }, { status: 401 });
      }
      
      if (b2Error.response?.status === 404) {
        return NextResponse.json({ 
          error: 'File not found on BackBlaze B2',
          details: `Could not find file: ${fileName} in bucket: ${bucketName}`,
        }, { status: 404 });
      }
      
      throw b2Error; // Re-throw to be caught by the outer catch
    }
  } catch (error: any) {
    console.error('Error downloading PDF from B2:', error);
    
    // Determine if this is a network error
    const isNetworkError = error.message?.includes('network') || 
                          error.code === 'ECONNREFUSED' ||
                          error.code === 'ENOTFOUND';
    
    return NextResponse.json({ 
      error: 'Failed to download PDF file',
      details: error.message || String(error),
      isNetworkError: isNetworkError
    }, { status: isNetworkError ? 503 : 500 });
  }
} 