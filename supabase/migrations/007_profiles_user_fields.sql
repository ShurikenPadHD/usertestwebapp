-- Add user profile fields (first name, last name, email, experience, company)
-- Run in Supabase SQL Editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS experience text,
  ADD COLUMN IF NOT EXISTS company_name text;

-- Update trigger to populate from raw_user_meta_data and auth email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val public.user_role;
BEGIN
  user_role_val := COALESCE(
    (NEW.raw_user_meta_data->>'role')::public.user_role,
    'tester'::public.user_role
  );
  INSERT INTO public.profiles (id, role, first_name, last_name, email, experience, company_name)
  VALUES (
    NEW.id,
    user_role_val,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    NEW.raw_user_meta_data->>'experience',
    NEW.raw_user_meta_data->>'company_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing profiles from auth.users
UPDATE public.profiles p
SET
  first_name = u.raw_user_meta_data->>'first_name',
  last_name = u.raw_user_meta_data->>'last_name',
  email = u.email,
  experience = u.raw_user_meta_data->>'experience',
  company_name = u.raw_user_meta_data->>'company_name'
FROM auth.users u
WHERE p.id = u.id;
