'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { B2Client } from '@/lib/backblaze';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onUploadComplete?: (fileUrl: string) => void;
  onUploadError?: (error: Error) => void;
  onUploadProgress?: (progress: number) => void;
  className?: string;
  variant?: "outline" | "default";
}

export function FileUpload({ 
  onUploadComplete, 
  onUploadError, 
  onUploadProgress,
  className,
  variant = "default"
}: FileUploadProps) {
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
      setUploadProgress(0);
    } catch (error: any) {
      console.error('Upload failed:', error);
      onUploadError?.(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <Button 
        variant={variant}
        className={className}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.onchange = (e) => handleFileChange(e as any);
          input.click();
        }}
        disabled={isUploading}
      >
        Choose file
      </Button>
    </div>
  );
} 