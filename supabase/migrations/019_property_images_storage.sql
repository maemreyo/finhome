-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true);

-- Set up storage policies for property images
CREATE POLICY "Property images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update their property images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete property images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

-- Add images column to properties table if it doesn't exist
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add helper function to get property image URLs
CREATE OR REPLACE FUNCTION get_property_image_urls(property_id UUID)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT images 
    FROM properties 
    WHERE id = property_id
  );
END;
$$;