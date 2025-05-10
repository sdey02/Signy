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
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return new NextResponse(null, { status: 204, headers });
}

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { fileUrl, labels } = body;

    if (!fileUrl || !labels) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // First authorize with B2
    await b2.authorize();

    // Get the file info from the URL
    const urlObj = new URL(fileUrl);
    const pathParts = urlObj.pathname.split('/');
    const bucketName = pathParts[2];
    const filePath = pathParts.slice(3).join('/');

    // Create the labels file name
    const labelsFileName = `${filePath}.labels.json`;

    // Get bucket info first
    const bucketResponse = await b2.getBucket({ bucketName });
    const bucketId = bucketResponse.data.bucketId;

    // Get upload URL
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId
    });

    // Create the labels buffer
    const labelsBuffer = Buffer.from(JSON.stringify(labels));

    // Upload the labels file
    await b2.uploadFile({
      uploadUrl: uploadUrlResponse.data.uploadUrl,
      uploadAuthToken: uploadUrlResponse.data.authorizationToken,
      fileName: labelsFileName,
      data: labelsBuffer,
      contentLength: labelsBuffer.length,
      mime: 'application/json'
    });

    // Set CORS headers in response
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    console.error('Error saving labels:', error);
    
    // Set CORS headers even in error response
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return NextResponse.json({ 
      error: 'Failed to save labels',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500, headers });
  }
} 