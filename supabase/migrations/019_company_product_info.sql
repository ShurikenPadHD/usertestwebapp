-- Add company and product information fields to tasks
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS product_tagline TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS founder_name TEXT,
ADD COLUMN IF NOT EXISTS company_description TEXT;
