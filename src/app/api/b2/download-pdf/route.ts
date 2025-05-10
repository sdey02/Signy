import { NextRequest, NextResponse } from 'next/server';
import B2 from 'backblaze-b2';

// Configure the API route with longer timeout
export const maxDuration = 300; // 5 minutes timeout
export const dynamic = 'force-dynamic';

// Function to handle proxying a PDF from B2
export async function GET(request: NextRequest) {
  try {
    // Get the file URL from the query parameters
    const fileUrl = request.nextUrl.searchParams.get('fileUrl');
    
    if (!fileUrl) {
      return NextResponse.json({
        error: 'Missing fileUrl parameter',
      }, { status: 400 });
    }
    
    // Parse the URL to get bucket and file path information
    let bucketName = '';
    let fileName = '';
    
    try {
      const url = new URL(fileUrl);
      // For BackBlaze URLs, format is https://f004.backblazeb2.com/file/{bucketName}/{filePath}
      const pathParts = url.pathname.split('/');
      if (pathParts[1] === 'file' && pathParts.length >= 3) {
        bucketName = pathParts[2];
        fileName = pathParts.slice(3).join('/');
      } else {
        throw new Error('Invalid BackBlaze URL format');
      }
    } catch (parseError) {
      console.error('Error parsing file URL:', parseError);
      return NextResponse.json({
        error: 'Invalid file URL format',
        details: parseError instanceof Error ? parseError.message : String(parseError),
      }, { status: 400 });
    }
    
    // Initialize B2 client
    const b2 = new B2({
      applicationKeyId: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY_ID!,
      applicationKey: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY!,
    });
    
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
      headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
  } catch (error) {
    console.error('Error in download-pdf API route:', error);
    return NextResponse.json({ 
      error: 'Failed to download PDF',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
} 