-- Fix: Populate profile from Google OAuth (full_name, given_name, family_name)
-- Google sends full_name, not first_name/last_name; also handle given_name/family_name when present

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val public.user_role;
  meta jsonb;
  fn text;
  ln text;
  em text;
BEGIN
  user_role_val := COALESCE(
    (NEW.raw_user_meta_data->>'role')::public.user_role,
    'tester'::public.user_role
  );
  meta := NEW.raw_user_meta_data;

  -- first_name: from given_name, or first word of full_name, or custom first_name
  fn := COALESCE(
    meta->>'first_name',
    meta->>'given_name',
    NULLIF(TRIM(SPLIT_PART(COALESCE(meta->>'full_name', meta->>'name', ''), ' ', 1)), '')
  );

  -- last_name: from family_name, or rest of full_name (after first space), or custom last_name
  ln := COALESCE(
    meta->>'last_name',
    meta->>'family_name',
    CASE
      WHEN position(' ' IN COALESCE(meta->>'full_name', meta->>'name', '')) > 0
      THEN TRIM(SUBSTRING(
        COALESCE(meta->>'full_name', meta->>'name', '')
        FROM position(' ' IN COALESCE(meta->>'full_name', meta->>'name', '')) + 1
      ))
      ELSE NULL
    END
  );

  -- email: from auth.users or metadata
  em := COALESCE(NEW.email, meta->>'email');

  INSERT INTO public.profiles (id, role, first_name, last_name, email, experience, company_name)
  VALUES (
    NEW.id,
    user_role_val,
    fn,
    ln,
    em,
    meta->>'experience',
    meta->>'company_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing profiles: users with full_name in auth but null first/last in profiles
UPDATE public.profiles p
SET
  first_name = COALESCE(
    p.first_name,
    NULLIF(TRIM(SPLIT_PART(COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''), ' ', 1)), '')
  ),
  last_name = COALESCE(
    p.last_name,
    CASE
      WHEN position(' ' IN COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '')) > 0
      THEN TRIM(SUBSTRING(
        COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '')
        FROM position(' ' IN COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '')) + 1
      ))
      ELSE NULL
    END
  ),
  email = COALESCE(p.email, u.email)
FROM auth.users u
WHERE p.id = u.id
  AND (p.first_name IS NULL OR p.last_name IS NULL OR p.email IS NULL)
  AND (u.raw_user_meta_data->>'full_name' IS NOT NULL
       OR u.raw_user_meta_data->>'name' IS NOT NULL
       OR u.raw_user_meta_data->>'given_name' IS NOT NULL
       OR u.email IS NOT NULL);
