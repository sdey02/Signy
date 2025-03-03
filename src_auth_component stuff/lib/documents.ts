import { createClient } from '@supabase/supabase-js';

export interface DocumentMetadata {
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  b2_file_id: string;
}

export class DocumentService {
  private static instance: DocumentService;
  private adminClient: any;

  private constructor() {
    this.adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          storageKey: 'supabase-documents-service-role',
        }
      }
    );
  }

  public static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  public async storeMetadata(metadata: DocumentMetadata): Promise<void> {
    try {
      const { error } = await this.adminClient
        .from('documents')
        .insert(metadata);

      if (error) {
        console.error('Documents: Failed to store metadata:', error);
        throw new Error('Failed to store document metadata');
      }

      console.log('Documents: Metadata stored successfully');
    } catch (error) {
      console.error('Documents: Error storing metadata:', error);
      throw error;
    }
  }

  public async getUserDocuments(userId: string): Promise<DocumentMetadata[]> {
    try {
      const { data, error } = await this.adminClient
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Documents: Failed to fetch user documents:', error);
        throw new Error('Failed to fetch user documents');
      }

      return data || [];
    } catch (error) {
      console.error('Documents: Error fetching user documents:', error);
      throw error;
    }
  }
} 