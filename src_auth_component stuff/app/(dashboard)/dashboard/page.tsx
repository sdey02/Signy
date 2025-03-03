'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { createBrowserClient } from '../../../lib/supabase';
import { FileText, Upload } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';

const supabase = createBrowserClient();

export default function DashboardPage() {
  const { user } = useAuth();
  const [documentsCount, setDocumentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get document count
        const { count, error } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error loading dashboard data:', error);
          return;
        }
        
        setDocumentsCount(count || 0);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Documents</p>
              <p className="text-2xl font-bold">{documentsCount}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/documents">
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-5 w-5" />
              View Documents
            </Button>
          </Link>
          <Link href="/documents">
            <Button className="w-full justify-start">
              <Upload className="mr-2 h-5 w-5" />
              Upload Document
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Welcome, {user?.email}</h2>
        <p className="text-gray-600">
          This is your document management dashboard. You can upload and manage your documents here.
        </p>
      </div>
    </div>
  );
} 