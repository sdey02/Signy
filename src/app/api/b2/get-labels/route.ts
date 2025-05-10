import { NextRequest, NextResponse } from 'next/server';
import B2 from 'backblaze-b2';

// Configure for dynamic behavior and longer timeout
export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes

// Set up B2 client
const b2 = new B2({
  applicationKeyId: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY_ID!,
  applicationKey: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY!,
});

// Define headers for OPTIONS requests (preflight)
export async function OPTIONS(request: NextRequest) {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return new NextResponse(null, { status: 204, headers });
}

export async function GET(request: NextRequest) {
  try {
    // Get the file URL parameter
    const fileUrl = request.nextUrl.searchParams.get('fileUrl');
    
    if (!fileUrl) {
      return NextResponse.json({ error: 'Missing fileUrl parameter' }, { status: 400 });
    }
    
    // Construct the label file URL
    const labelFileUrl = `${fileUrl}.labels.json`;
    
    // Parse URL to get bucket and file information
    const urlObj = new URL(labelFileUrl);
    const pathParts = urlObj.pathname.split('/');
    const bucketName = pathParts[2];
    const fileName = pathParts.slice(3).join('/');
    
    console.log(`Fetching labels for file: ${fileName} from bucket: ${bucketName}`);
    
    // Authorize with B2
    await b2.authorize();
    
    try {
      // Download the labels file
      const response = await b2.downloadFileByName({
        bucketName,
        fileName,
        responseType: 'json'
      });
      
      // Set CORS headers
      const headers = new Headers();
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      headers.set('Cache-Control', 'no-cache');
      headers.set('Content-Type', 'application/json');
      
      return NextResponse.json(response.data, { headers });
    } catch (b2Error: any) {
      // If the file is not found, return an empty array of labels
      if (b2Error.response?.status === 404) {
        console.log('Labels file not found, returning empty labels');
        
        const headers = new Headers();
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        headers.set('Cache-Control', 'no-cache');
        headers.set('Content-Type', 'application/json');
        
        return NextResponse.json([], { headers });
      }
      
      // For other errors, throw to be caught by the outer catch
      throw b2Error;
    }
  } catch (error) {
    console.error('Error fetching labels:', error);
    
    // Set CORS headers even in error response
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return NextResponse.json({ 
      error: 'Failed to fetch labels',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500, headers });
  }
} 