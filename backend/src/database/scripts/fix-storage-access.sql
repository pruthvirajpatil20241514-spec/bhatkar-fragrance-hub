-- SQL to make the 'products' storage bucket public
-- This allows anyone with the URL to view the images without authentication.

UPDATE storage.buckets
SET public = true
WHERE id = 'products';

-- Verify the change
SELECT id, name, public FROM storage.buckets WHERE id = 'products';
