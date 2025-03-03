'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

// This must be dynamic as it handles share tokens
export const dynamic = 'force-dynamic'

export default function SharedFilePage({ params }: { params: { token: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] = useState<any>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    async function loadSharedFile() {
      try {
        const { data: shareData, error: shareError } = await supabase
          .from('file_shares')
          .select(`
            *,
            documents:document_id (*)
          `)
          .eq('access_token', params.token)
          .single();

        if (shareError) throw shareError;
        if (!shareData) throw new Error('Share not found');

        const now = new Date();
        const expiryDate = new Date(shareData.expires_at);
        
        if (now > expiryDate) {
          throw new Error('This share link has expired');
        }

        setFileData(shareData.documents);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadSharedFile();
  }, [params.token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#edb5b5] rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center">
        <div className="text-red-400 mb-4">{error}</div>
        <Button
          variant="outline"
          className="border-[#333] text-white hover:bg-[#333]"
          onClick={() => window.location.href = '/'}
        >
          Return to home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <FileText className="h-8 w-8 text-[#edb5b5]" />
            <div>
              <h1 className="text-xl font-semibold">{fileData.file_name}</h1>
              <p className="text-gray-400 text-sm">Shared file</p>
            </div>
          </div>
          
          <Button
            className="bg-[#edb5b5] text-black hover:bg-[#f2c4c4] w-full"
            onClick={() => window.open(fileData.file_url, '_blank')}
          >
            View file
          </Button>
        </div>
      </div>
    </div>
  );
} 