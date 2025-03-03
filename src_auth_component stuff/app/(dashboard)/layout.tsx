'use client';

import { useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, FileText, LayoutDashboard } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  // Redirect to sign in page if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Only render the layout if user is authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="flex items-center justify-between max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-800">
              Document Manager
            </Link>
          </div>
          <div className="flex items-center">
            <span className="mr-4 text-sm text-gray-600">
              {user.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar and Content */}
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sidebar */}
        <aside className="w-64 mr-8">
          <nav className="space-y-1">
            <Link 
              href="/dashboard" 
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md shadow hover:bg-gray-50"
            >
              <LayoutDashboard className="w-5 h-5 mr-3 text-gray-500" />
              Dashboard
            </Link>
            <Link 
              href="/documents" 
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md shadow hover:bg-gray-50 mt-2"
            >
              <FileText className="w-5 h-5 mr-3 text-gray-500" />
              Documents
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded-lg shadow">
          {children}
        </main>
      </div>
    </div>
  );
} 