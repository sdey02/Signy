import { NextRequest, NextResponse } from 'next/server';

/**
 * This API route proxies requests to PDF files to bypass CORS restrictions.
 * It fetches the PDF file from the provided URL and returns it with appropriate headers.
 */
export async function GET(request: NextRequest) {
  // Get the URL to proxy from query params
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }
  
  try {
    // Validate URL
    const parsedUrl = new URL(url);
    
    // For security, you might want to add restrictions on which domains are allowed
    const allowedDomains = [
      'f004.backblazeb2.com',
      'cdn.filestackcontent.com',
      // Add other domains you trust here
    ];
    
    // Check if the hostname is in the allowed domains
    if (!allowedDomains.some(domain => parsedUrl.hostname.includes(domain))) {
      return NextResponse.json({ 
        error: 'Access to this domain is not allowed' 
      }, { status: 403 });
    }
    
    // Fetch the file
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json({
        error: `Failed to fetch PDF, status: ${response.status}`,
      }, { status: response.status });
    }
    
    // Get the file content as ArrayBuffer
    const fileBuffer = await response.arrayBuffer();
    
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
  } catch (error) {
    console.error('Error proxying PDF:', error);
    return NextResponse.json({ 
      error: 'Failed to proxy PDF file',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
} 