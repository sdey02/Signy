import { NextRequest, NextResponse } from 'next/server';
import B2 from 'backblaze-b2';

const b2 = new B2({
  applicationKeyId: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY_ID!,
  applicationKey: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY!,
});

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authResponse = await b2.authorize();
    
    return NextResponse.json({
      downloadUrl: authResponse.data.downloadUrl,
      apiUrl: authResponse.data.apiUrl,
      authorizationToken: authResponse.data.authorizationToken,
      allowed: {
        bucketId: authResponse.data.allowed.bucketId,
        capabilities: authResponse.data.allowed.capabilities,
      }
    });
  } catch (error: any) {
    console.error('B2 Authorization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to authorize with B2' },
      { status: 500 }
    );
  }
} 