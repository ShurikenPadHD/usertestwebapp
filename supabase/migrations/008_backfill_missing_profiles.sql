-- Create profiles for users in auth.users who don't have one (e.g. after manual profile deletion)
-- Run in Supabase SQL Editor

INSERT INTO public.profiles (id, role, first_name, last_name, email, experience, company_name)
SELECT
  u.id,
  COALESCE((u.raw_user_meta_data->>'role')::public.user_role, 'tester'::public.user_role),
  u.raw_user_meta_data->>'first_name',
  u.raw_user_meta_data->>'last_name',
  u.email,
  u.raw_user_meta_data->>'experience',
  u.raw_user_meta_data->>'company_name'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
