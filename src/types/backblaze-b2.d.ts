declare module 'backblaze-b2' {
  interface B2Options {
    applicationKeyId: string;
    applicationKey: string;
  }

  interface B2Response<T> {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: any;
    request: any;
    data: T;
  }

  interface BucketInfo {
    bucketId: string;
    bucketName: string;
    bucketType: string;
  }

  interface UploadUrlResponse {
    uploadUrl: string;
    authorizationToken: string;
  }

  class B2 {
    constructor(options: B2Options);
    authorize(): Promise<B2Response<any>>;
    getBucket(options: { bucketName: string }): Promise<B2Response<BucketInfo>>;
    getUploadUrl(options: { bucketId: string }): Promise<B2Response<UploadUrlResponse>>;
    uploadFile(options: {
      uploadUrl: string;
      uploadAuthToken: string;
      fileName: string;
      data: Buffer | ArrayBuffer;
      contentLength: number;
      mime?: string;
    }): Promise<B2Response<any>>;
    downloadFileByName(options: {
      bucketName: string;
      fileName: string;
      responseType: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
    }): Promise<B2Response<any>>;
  }

  export default B2;
} 