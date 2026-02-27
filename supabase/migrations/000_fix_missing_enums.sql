-- Fix: Create enums if missing
-- Run in Supabase Dashboard → SQL Editor (project: izkvsoruhuxjexkhotuv)
-- If a type already exists, that statement will error—skip it and continue.

CREATE TYPE user_role AS ENUM ('developer', 'tester');
CREATE TYPE trust_level AS ENUM ('new', 'regular', 'trusted');
CREATE TYPE task_status AS ENUM ('draft', 'posted', 'claimed', 'submitted', 'completed');
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_status AS ENUM ('held', 'released', 'disputed');
