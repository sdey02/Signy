'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { B2Client } from '@/lib/backblaze';

interface FileUploadProps {
  onUploadComplete?: (fileUrl: string) => void;
  onUploadError?: (error: Error) => void;
  onUploadProgress?: (progress: number) => void;
}

export function FileUpload({ onUploadComplete, onUploadError, onUploadProgress }: FileUploadProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const b2Client = B2Client.getInstance();
      await b2Client.initialize();

      const { fileUrl } = await b2Client.uploadFile({
        file,
        userId: user.id,
        onProgress: (progress) => {
          setUploadProgress(progress);
          onUploadProgress?.(progress);
        }
      });

      onUploadComplete?.(fileUrl);
    } catch (error: any) {
      console.error('Upload failed:', error);
      onUploadError?.(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-violet-50 file:text-violet-700
                  hover:file:bg-violet-100
                  disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {isUploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-violet-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}
    </div>
  );
} 