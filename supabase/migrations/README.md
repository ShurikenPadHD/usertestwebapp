# Supabase Migrations

Run these in order in **Supabase Dashboard → SQL Editor**:

0. `000_fix_missing_enums.sql` (run first if signup fails with "type user_role does not exist")
1. `001_enums.sql`
2. `002_profiles.sql`
3. `003_tasks.sql`
4. `004_submissions.sql`
5. `005_transactions.sql`
6. `006_reviews.sql`
7. `007_profiles_user_fields.sql` (adds first_name, last_name, email, experience, company_name)

Copy each file's contents, paste into the SQL Editor, and click Run.
