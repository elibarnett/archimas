-- Add thumbnail and capture date metadata to documents
ALTER TABLE public.documents
  ADD COLUMN thumbnail_path text,
  ADD COLUMN captured_at timestamptz;
