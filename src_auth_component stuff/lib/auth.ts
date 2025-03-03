import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export interface AuthUser {
  id: string;
  email: string;
}

export class AuthService {
  private static instance: AuthService;
  private serviceClient: any;

  private constructor() {
    this.serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          persistSession: false,
        }
      }
    );
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async getUserIdFromRequest(request: NextRequest): Promise<string | null> {
    try {
      // Try to get user from auth cookie
      const authCookie = request.cookies.get('sb-access-token') || request.cookies.get('sb-refresh-token');
      if (authCookie) {
        const { data: userData, error: userError } = await this.serviceClient.auth.getUser(authCookie.value);
        if (userData?.user && !userError) {
          console.log(`Auth: User found via cookie: ${userData.user.email}`);
          return userData.user.id;
        }
      }

      // Try to get user from header
      const userIdHeader = request.headers.get('X-User-ID');
      if (userIdHeader) {
        // In development, trust the header
        if (process.env.NODE_ENV === 'development') {
          console.log(`Auth: Using user ID from header: ${userIdHeader.substring(0, 8)}...`);
          return userIdHeader;
        }
      }

      // In production, require authentication
      if (process.env.NODE_ENV === 'production') {
        console.error('Auth: No valid authentication found');
        return null;
      }

      // Development fallback
      console.warn('⚠️ Auth: Development mode - using fallback UUID');
      return '00000000-0000-0000-0000-000000000000';
    } catch (error) {
      console.error('Auth: Error getting user ID:', error);
      return null;
    }
  }
} 