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
    
    // Extract file info from URL
    // Example URL format: https://f004.backblazeb2.com/file/Orion-BackBlaze/documents/68076df7-fde2-4678-aad7-87abca8d403e/1741065230226-Ace_Your_Tech_Interview.pdf
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // The bucket name is the first part after /file/
    const bucketName = pathParts[2];
    
    // The file name is everything after the bucket name
    const fileName = pathParts.slice(3).join('/');
    
    // Authorize with B2
    await b2.authorize();
    
    // Download the file from B2
    const response = await b2.downloadFileByName({
      bucketName,
      fileName,
      responseType: 'arraybuffer'
    });
    
    // Get the file data
    const fileBuffer = response.data;
    
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
  } catch (error: any) {
    console.error('Error downloading PDF from B2:', error);
    return NextResponse.json({ 
      error: 'Failed to download PDF file',
      details: error.message || String(error),
    }, { status: 500 });
  }
} 