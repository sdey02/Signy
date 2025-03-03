export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          file_name: string
          file_size: number
          file_url: string
          created_at: string
          file_type: string
          b2_file_id: string
          user_id: string
        }
        Insert: {
          id?: string
          file_name: string
          file_size: number
          file_url: string
          created_at?: string
          file_type: string
          b2_file_id: string
          user_id: string
        }
        Update: {
          id?: string
          file_name?: string
          file_size?: number
          file_url?: string
          created_at?: string
          file_type?: string
          b2_file_id?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 