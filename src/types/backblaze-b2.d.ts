declare module 'backblaze-b2' {
  interface B2Options {
    applicationKeyId: string;
    applicationKey: string;
    retry?: {
      retries?: number;
      [key: string]: any;
    };
    axios?: any;
  }

  interface B2Response {
    status: number;
    statusText: string;
    headers: any;
    config: any;
    request: any;
    data: any;
  }

  class B2 {
    constructor(options: B2Options);
    
    authorize(options?: any): Promise<B2Response>;
    
    downloadFileByName(options: {
      bucketName: string;
      fileName: string;
      responseType: string;
      onDownloadProgress?: (event: any) => void;
      [key: string]: any;
    }): Promise<B2Response>;
    
    downloadFileById(options: {
      fileId: string;
      responseType: string;
      onDownloadProgress?: (event: any) => void;
      [key: string]: any;
    }): Promise<B2Response>;
    
    // Add other methods as needed
    
    KEY_CAPABILITIES: {
      READ_FILES: string;
      [key: string]: string;
    };
  }

  export default B2;
} 