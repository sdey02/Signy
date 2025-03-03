import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase clients with distinct storage keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Singleton admin client for this route
const adminSupabaseClient = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

export async function GET(request: NextRequest) {
  try {
    // Extract auth cookies directly from the request
    const authCookie = request.cookies.get('sb-access-token');
    const refreshCookie = request.cookies.get('sb-refresh-token');
    
    // Create auth client with a unique storage key for this request
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        storageKey: 'supabase-debug-auth', // Unique storage key
      }
    });
    
    // Set the session if cookies exist
    let authData: any = { data: { session: null } };
    let authError = null;
    
    if (authCookie) {
      const sessionResult = await supabase.auth.setSession({
        access_token: authCookie.value,
        refresh_token: refreshCookie?.value || '',
      });
      
      if (sessionResult.error) {
        authError = sessionResult.error;
      } else {
        const sessionResponse = await supabase.auth.getSession();
        authData = sessionResponse;
      }
    }
    
    // Check if documents table exists and get structure (using admin client)
    const { data: tableInfo, error: tableError } = await adminSupabaseClient
      .from('documents')
      .select('*')
      .limit(1);
    
    // Try to insert a test record with valid UUID (using admin client)
    const testDocument = {
      user_id: '00000000-0000-0000-0000-000000000000', // Valid UUID format
      file_name: 'test-document.pdf',
      file_size: 1024,
      file_type: 'application/pdf',
      b2_file_id: 'test-b2-file-id',
      file_url: 'https://example.com/test-file.pdf'
    };
    
    const { data: insertData, error: insertError } = await adminSupabaseClient
      .from('documents')
      .insert(testDocument)
      .select();
    
    // If insertion succeeded, delete test record (using admin client)
    let deleteResult = null;
    let deleteError = null;
    
    if (insertData && insertData.length > 0) {
      const testId = insertData[0].id;
      const { data: deleteData, error: delError } = await adminSupabaseClient
        .from('documents')
        .delete()
        .eq('id', testId)
        .select();
      
      deleteResult = deleteData;
      deleteError = delError;
    }
    
    // Return all debug info
    return NextResponse.json({
      auth: {
        session: authData.session,
        error: authError,
        cookiesPresent: {
          accessToken: !!authCookie,
          refreshToken: !!refreshCookie,
        }
      },
      databaseTable: {
        exists: !tableError,
        info: tableInfo,
        error: tableError,
      },
      testInsertion: {
        success: !insertError && insertData && insertData.length > 0,
        data: insertData,
        error: insertError,
      },
      testDeletion: {
        success: !deleteError,
        data: deleteResult,
        error: deleteError,
      },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 10) + '...',
        supabaseKeyPartial: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...',
        serviceRoleKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        b2KeyIdPartial: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY_ID?.substring(0, 5) + '...',
        b2KeyPartial: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY?.substring(0, 5) + '...',
        b2BucketId: process.env.NEXT_PUBLIC_B2_BUCKET_ID?.substring(0, 5) + '...',
        b2BucketName: process.env.NEXT_PUBLIC_B2_BUCKET_NAME,
      }
    });
    
  } catch (error: any) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      error: error.message || 'An error occurred during debugging',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 