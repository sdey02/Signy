-- Create a simple health check table for connection testing
CREATE TABLE IF NOT EXISTS health_check (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a test record
INSERT INTO health_check (message) VALUES ('Supabase is working correctly!');

-- Allow anonymous access to this table for connection testing
ALTER TABLE health_check ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_health_check ON health_check FOR SELECT USING (true);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  b2_file_id TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting documents
CREATE POLICY select_document_policy ON documents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for inserting documents
CREATE POLICY insert_document_policy ON documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for updating documents
CREATE POLICY update_document_policy ON documents
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy for deleting documents
CREATE POLICY delete_document_policy ON documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at(); 