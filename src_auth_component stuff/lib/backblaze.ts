import B2 from 'backblaze-b2';

export interface B2UploadOptions {
  file: File;
  userId: string;
  onProgress?: (progress: number) => void;
}

export class B2Client {
  private static instance: B2Client;
  private b2: any;

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
      await this.b2.authorize();
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
      // Get upload URL
      const { data: { uploadUrl, authorizationToken } } = await this.b2.getUploadUrl({
        bucketId: process.env.NEXT_PUBLIC_B2_BUCKET_ID!
      });

      // Create unique filename
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const storagePath = `documents/${userId}/${uniqueFileName}`;

      // Convert file to buffer
      const fileData = await file.arrayBuffer();
      const buffer = Buffer.from(fileData);

      // Upload file
      const uploadResponse = await this.b2.uploadFile({
        uploadUrl,
        uploadAuthToken: authorizationToken,
        fileName: storagePath,
        data: buffer,
        onUploadProgress: (progress: { percent: number }) => {
          onProgress?.(progress.percent);
        }
      });

      // Generate public URL
      const fileUrl = `${process.env.NEXT_PUBLIC_B2_FILE_URL_PREFIX}/${storagePath}`;

      return {
        fileUrl,
        fileId: uploadResponse.data?.fileId || 'unknown',
        storagePath
      };
    } catch (error) {
      console.error('B2: Upload failed:', error);
      throw new Error('Failed to upload file to B2');
    }
  }
} 