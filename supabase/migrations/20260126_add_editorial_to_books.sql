-- Migration: Add editorial (publisher) field to books table
-- This field is NULLABLE to support existing books without editorial

ALTER TABLE books ADD COLUMN IF NOT EXISTS editorial VARCHAR(255);

-- No default value needed - existing books will have NULL which is handled in the UI
