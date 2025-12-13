-- Add mobile_media_url column to main_images table for smartphone-optimized images
ALTER TABLE main_images ADD COLUMN mobile_media_url TEXT;
