'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { createBrowserClient } from '../../../lib/supabase';

const supabase = createBrowserClient();

export default function DocumentsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const { user, isLoading } = useAuth();
  
  // Check authentication status
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('No user found in documents page, redirecting to sign in');
      router.push('/auth/signin');
    }
  }, [isLoading, user, router]);
  
  // Return early if still loading or no user
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        <p className="ml-2">Loading your session...</p>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in the useEffect
  }
  
  // Load user's documents
  useEffect(() => {
    async function loadDocuments() {
      if (!user) return;
      
      try {
        setIsLoadingDocs(true);
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error loading documents:', error);
          return;
        }
        
        setDocuments(data || []);
      } catch (err) {
        console.error('Failed to load documents:', err);
      } finally {
        setIsLoadingDocs(false);
      }
    }
    
    loadDocuments();
  }, [user]);
  
  // Trigger file input click when button is clicked
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }
    
    try {
      setError(null);
      setIsUploading(true);
      setUploadProgress(10);
      
      // Create form data for the file
      const formData = new FormData();
      formData.append('file', file);
      
      setUploadProgress(30);
      
      // Debug: Log authentication status before upload
      console.log('Current user before upload:', user?.id);
      console.log('Supabase session before upload:', await supabase.auth.getSession());
      
      // Important: Include credentials to send auth cookies
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // This is crucial for sending cookies
        // Add manual cookie handling for browsers that need it
        headers: {
          'X-User-ID': user?.id || '', // Add user ID as header as backup
        },
      });
      
      setUploadProgress(70);
      
      // Get the response body
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error uploading file');
      }
      
      setUploadProgress(100);
      alert('File uploaded successfully!');
      
      // Refresh the document list
      if (user) {
        const { data } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        setDocuments(data || []);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      alert(`Error uploading file: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      // We don't reset progress to 0 immediately if there was an error
      if (!error) {
        setUploadProgress(0);
      }
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Documents</h1>
        
        <div>
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            id="file-upload"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          
          {/* Visible button that triggers the file input */}
          <button 
            onClick={handleButtonClick}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </div>
      
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Upload Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Document List */}
      {isLoadingDocs ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      ) : documents.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{doc.file_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatFileSize(doc.file_size)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(doc.created_at)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a 
                      href={doc.file_url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-500">
            You haven't uploaded any documents yet. Upload a PDF document to get started.
          </p>
        </div>
      )}
    </div>
  );
} 