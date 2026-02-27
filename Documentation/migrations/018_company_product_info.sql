-- =====================================================
-- Migration: Add Company/Product Info to Tasks + AI Analysis to Submissions
-- Run this in Supabase SQL Dashboard
-- =====================================================

-- =====================================================
-- PART 1: Company & Product Info for Tasks
-- =====================================================

-- Add company and product information fields to tasks
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS product_tagline TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS founder_name TEXT,
ADD COLUMN IF NOT EXISTS company_description TEXT;

-- =====================================================
-- PART 2: AI Analysis for Submissions  
-- =====================================================

-- Add AI analysis JSONB column to store video analysis results
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS ai_analysis JSONB;

-- =====================================================
-- PART 3: Example Data (Optional - for testing)
-- =====================================================

-- Example: Update a task with company info (run manually if needed)
-- UPDATE public.tasks 
-- SET 
--   company_name = 'Acme Inc',
--   product_name = 'Acme App', 
--   product_tagline = 'The simplest todo list for teams',
--   company_website = 'https://acme.com',
--   founder_name = 'John Doe',
--   company_description = 'We build productivity tools for remote teams'
-- WHERE id = 'your-task-id-here';

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check tasks columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name IN ('company_name', 'product_name', 'product_tagline', 'company_website', 'founder_name', 'company_description');

-- Check submissions columns  
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'submissions' 
AND column_name = 'ai_analysis';