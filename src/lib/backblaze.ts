import B2 from 'backblaze-b2';

export interface B2UploadOptions {
  file: File;
  userId: string;
  onProgress?: (progress: number) => void;
}

interface B2AuthResponse {
  downloadUrl: string;
  apiUrl: string;
  authorizationToken: string;
  allowed: {
    bucketId: string;
    capabilities: string[];
  };
}

export class B2Client {
  private static instance: B2Client;
  private b2: any;
  private authData: B2AuthResponse | null = null;

  private constructor() {
    this.b2 = new B2({
      applicationKeyId: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY_ID!,
      applicationKey: process.env.NEXT_PUBLIC_B2_APPLICATION_KEY!,
      retry: {
        retries: 3
      }
    });
  }

  public static getInstance(): B2Client {
    if (!B2Client.instance) {
      B2Client.instance = new B2Client();
    }
    return B2Client.instance;
  }

  public async initialize(): Promise<void> {
    try {
      const response = await fetch('/api/b2/authorize');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initialize B2 client');
      }
      
      this.authData = await response.json();
      console.log('B2: Authorization successful');
    } catch (error) {
      console.error('B2: Authorization failed:', error);
      throw new Error('Failed to initialize B2 client');
    }
  }

  public async uploadFile({ file, userId, onProgress }: B2UploadOptions): Promise<{
    fileUrl: string;
    fileId: string;
    storagePath: string;
  }> {
    try {
      if (!this.authData) {
        await this.initialize();
      }

      // Create form data for the file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      // Upload through our API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload file');
      }

      const result = await response.json();
      return {
        fileUrl: result.fileUrl,
        fileId: result.fileId,
        storagePath: result.storagePath
      };
    } catch (error) {
      console.error('B2: Upload failed:', error);
      throw new Error('Failed to upload file to B2');
    }
  }
} 