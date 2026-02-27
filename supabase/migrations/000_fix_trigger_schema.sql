-- Fix: Ensure trigger resolves user_role in public schema
-- Run in Supabase SQL Editor (project izkvsoruhuxjexkhotuv)

-- Step 1: Create enums in public schema if missing (profiles table needs both)
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('developer', 'tester');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE public.trust_level AS ENUM ('new', 'regular', 'trusted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Step 2: Recreate trigger with explicit schema qualifier
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val public.user_role;
BEGIN
  user_role_val := COALESCE(
    (NEW.raw_user_meta_data->>'role')::public.user_role,
    'tester'::public.user_role
  );
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, user_role_val);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
