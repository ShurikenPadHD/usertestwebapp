---
name: supabase-db-audit
description: Audits Supabase database schema, migrations, and RLS policies for security, performance, and consistency. Use when the user asks for a "sanity check", "database audit", or "schema validation" of their Supabase project.
---

# Supabase Database Audit & Sanity Check

## Purpose
This skill performs a comprehensive audit of the Supabase database setup, checking for security vulnerabilities (RLS), performance issues (indexes), and schema consistency.

## Workflow

1.  **Gather Context**:
    -   Locate migration files in `supabase/migrations/`.
    -   Check if Supabase MCP server is available/enabled (for live introspection).

2.  **Analyze Schema & Migrations**:
    -   **Security (RLS)**:
        -   Verify `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` for ALL tables.
        -   Check for `CREATE POLICY` statements for every table.
        -   Flag any policies using `USING (true)` (public access) unless explicitly justified.
        -   Check if `service_role` key is being used inappropriately in client-side code (if visible).
    -   **Performance**:
        -   Identify Foreign Keys (`REFERENCES table(id)`).
        -   **CRITICAL**: Check if every Foreign Key column has a corresponding `CREATE INDEX`. Postgres does NOT index FKs by default.
        -   Flag `SELECT *` in views or functions (prefer explicit column lists).
    -   **Consistency & Best Practices**:
        -   Naming: Verify `snake_case` for tables and columns.
        -   Primary Keys: Ensure every table has a Primary Key (UUID preferred for distributed systems).
        -   Timestamps: Check for `created_at` and `updated_at` (with triggers) on resource tables.
        -   Types: Prefer `timestamptz` over `timestamp`.

3.  **Live Introspection (if MCP available)**:
    -   Use `list_tables` (verbose mode) to get the *actual* current schema.
    -   Compare live schema vs. migrations (drift detection).
    -   Use `execute_sql` to run specific sanity checks if needed (e.g., finding tables without RLS).

4.  **Generate Report**:
    -   Produce a Markdown report using the template below.

## Audit Report Template

```markdown
# 🛡️ Supabase Database Sanity Check Report

## 🚨 Critical Issues
- [ ] **RLS Disabled**: Table `xyz` has RLS disabled.
- [ ] **Public Access**: Policy on `abc` allows full public access.

## ⚠️ Performance Warnings
- [ ] **Unindexed Foreign Keys**:
    - `table_name.column_id` -> `referenced_table.id`
- [ ] **N+1 Risk**: Detected in ...

## ℹ️ Schema & Consistency
- [ ] **Naming**: Table `UserProfiles` should be `user_profiles`.
- [ ] **Timestamps**: Table `logs` missing `created_at`.

## ✅ Passed Checks
- [x] All tables have Primary Keys.
- [x] RLS enabled on 15/16 tables.
```

## Tools
- Use `Read` to analyze `supabase/migrations/*.sql`.
- Use `Supabase MCP` tools (`list_tables`, `execute_sql`) if available.
