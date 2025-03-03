import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
    const { pathname } = req.nextUrl;
    const isAuthRoute = pathname.startsWith('/auth') || 
                       pathname.startsWith('/login') || 
                       pathname.startsWith('/signup');
    const isPublicRoute = pathname.startsWith('/_next') || 
                         pathname.startsWith('/favicon.ico') ||
                         pathname === '/';
    const isApiRoute = pathname.startsWith('/api/');
    
    // Skip auth check for public routes and auth routes themselves
    if (isAuthRoute || isPublicRoute) {
      return res;
    }
    
    // Create a Supabase client for checking auth
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            res.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            res.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('Middleware: Active session found for user', session.user.id);
    } else {
      console.log('Middleware: No active session found for', pathname);
      
      // Check if this is a protected dashboard route that requires auth
      const isProtectedUIRoute = pathname.startsWith('/dashboard/');
      
      // Only redirect for protected UI routes, not for API routes
      if (isProtectedUIRoute && !isApiRoute) {
        console.log('Middleware: Redirecting to login from protected route');
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }
  } catch (e) {
    console.error('Middleware error:', e);
  }

  return res;
}

// Apply middleware only to routes that need authentication
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}; 