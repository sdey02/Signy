import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client without using cookies from next/headers
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    // Create a client specifically for the callback with a unique storage key
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        storageKey: 'supabase-callback-auth', // Unique storage key for this operation
      }
    });
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/auth/signin?error=callback_failed', request.url));
    }
    
    // Redirect to the documents page after successful auth
    return NextResponse.redirect(new URL('/documents', request.url));
  }
  
  // If no code provided, redirect to signin page
  return NextResponse.redirect(new URL('/auth/signin', request.url));
} 