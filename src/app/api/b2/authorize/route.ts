import { NextRequest, NextResponse } from 'next/server';
import B2 from 'backblaze-b2';

// Set up B2 client with environment variables
const getB2Client = () => {
  const applicationKeyId = process.env.NEXT_PUBLIC_B2_APPLICATION_KEY_ID;
  const applicationKey = process.env.NEXT_PUBLIC_B2_APPLICATION_KEY;
  
  if (!applicationKeyId || !applicationKey) {
    throw new Error('Missing B2 credentials in environment variables');
  }
  
  return new B2({
    applicationKeyId,
    applicationKey,
  });
};

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check that we have valid B2 credentials
    if (!process.env.NEXT_PUBLIC_B2_APPLICATION_KEY_ID || !process.env.NEXT_PUBLIC_B2_APPLICATION_KEY) {
      console.error('Missing B2 credentials in environment variables');
      return NextResponse.json({
        error: 'Server configuration error: Missing B2 credentials',
      }, { status: 500 });
    }
    
    console.log('Authorizing with BackBlaze B2...');
    const b2 = getB2Client();
    const authResponse = await b2.authorize();
    console.log('B2 authorization successful');
    
    // Validate the response
    if (!authResponse.data.downloadUrl || !authResponse.data.authorizationToken) {
      console.error('B2 returned incomplete authorization data:', authResponse.data);
      return NextResponse.json({
        error: 'B2 returned incomplete authorization data',
      }, { status: 500 });
    }
    
    // Return successful response with auth details
    return NextResponse.json({
      downloadUrl: authResponse.data.downloadUrl,
      apiUrl: authResponse.data.apiUrl,
      authorizationToken: authResponse.data.authorizationToken,
      allowed: {
        bucketId: authResponse.data.allowed.bucketId,
        capabilities: authResponse.data.allowed.capabilities,
      },
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24-hour expiry
    });
  } catch (error: any) {
    console.error('B2 Authorization error:', error);
    
    // Provide more specific error messages based on error type
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid B2 credentials' },
        { status: 401 }
      );
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Could not connect to B2 API' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to authorize with B2',
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
} 