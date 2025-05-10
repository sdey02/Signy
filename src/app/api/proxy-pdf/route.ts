import { NextRequest, NextResponse } from 'next/server';

// Configure for dynamic behavior and longer timeout
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return new NextResponse(null, { status: 204, headers });
}

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
    
    // Check if this is a BackBlaze URL
    const isBackBlazeUrl = parsedUrl.hostname.includes('backblazeb2.com');
    
    // Fetch the file
    const response = await fetch(url);
    
    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      console.error(`Authentication error (${response.status}) accessing PDF at ${url}`);
      
      // For BackBlaze URLs, suggest using the specialized endpoint
      if (isBackBlazeUrl) {
        return NextResponse.json({
          error: 'Authentication error accessing BackBlaze file. Try using the /api/b2/download-pdf endpoint instead.',
          useB2Endpoint: true
        }, { status: 401 });
      }
      
      return NextResponse.json({
        error: `Authentication error (${response.status}) accessing PDF file. The file might require authorization.`,
      }, { status: 401 });
    }
    
    if (!response.ok) {
      return NextResponse.json({
        error: `Failed to fetch PDF, status: ${response.status}`,
        details: await response.text().catch(() => 'No error details available')
      }, { status: response.status });
    }
    
    // Verify the content type is a PDF
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('pdf') && !contentType.includes('octet-stream')) {
      console.warn(`Warning: Content-Type is not a PDF: ${contentType}`);
    }
    
    // Get the file content as ArrayBuffer
    const fileBuffer = await response.arrayBuffer();
    
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
  } catch (error) {
    console.error('Error proxying PDF:', error);
    return NextResponse.json({ 
      error: 'Failed to proxy PDF file',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
} 