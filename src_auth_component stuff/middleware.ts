import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next();
  
  try {
    // Skip middleware for non-auth related paths to prevent infinite loops
    const { pathname } = req.nextUrl;
    const isAuthRoute = pathname.startsWith('/auth');
    const isPublicRoute = pathname.startsWith('/_next') || 
                          pathname.startsWith('/favicon.ico') ||
                          pathname === '/';
    const isApiRoute = pathname.startsWith('/api/');
    
    // Skip auth check for public routes and auth routes themselves
    if (isAuthRoute || isPublicRoute) {
      return res;
    }
    
    // Only use this middleware for routes that require authentication
    const supabase = createMiddlewareClient({ req, res });
    
    // Refresh session if expired - this will set new cookies
    const { data: { session } } = await supabase.auth.getSession();
    
    // Log for debugging
    if (session) {
      console.log('Middleware: Active session found for user', session.user.id);
    } else {
      console.log('Middleware: No active session found for', pathname);
      
      // Check if this is a protected dashboard route that requires auth
      // Do NOT redirect API routes - let them handle their own auth responses
      const isProtectedUIRoute = pathname.startsWith('/(dashboard)/') || 
                               pathname.startsWith('/dashboard/');
      
      // Only redirect for protected UI routes, not for API routes
      if (isProtectedUIRoute && !isApiRoute) {
        console.log('Middleware: Redirecting to sign-in from protected route');
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }
  } catch (e) {
    // In case of error, just log and continue
    console.error('Middleware error:', e);
  }

  return res;
}

// Apply middleware only to routes that need authentication
export const config = {
  matcher: [
    // Apply to dashboard routes only, not API routes
    '/(dashboard)/:path*',
    '/dashboard/:path*',
  ],
}; 