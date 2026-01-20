-- =====================================================
-- SUPABASE USER SYNC SETUP
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. Function to sync Supabase auth.users with your User table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."User" ("supabaseId", email, "passwordHash", name, "createdAt")
  VALUES (
    NEW.id::text,  -- Supabase UUID
    NEW.email,
    '',  -- Supabase handles passwords
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'full_name', 
      split_part(NEW.email, '@', 1)
    ),
    NEW.created_at
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, ignore
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger that fires after user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill existing Supabase users to your User table
INSERT INTO public."User" ("supabaseId", email, "passwordHash", name, "createdAt")
SELECT 
  id::text,
  email,
  '',
  COALESCE(
    raw_user_meta_data->>'name', 
    raw_user_meta_data->>'full_name', 
    split_part(email, '@', 1)
  ),
  created_at
FROM auth.users
WHERE id::text NOT IN (
  SELECT "supabaseId" 
  FROM public."User" 
  WHERE "supabaseId" IS NOT NULL
)
ON CONFLICT ("supabaseId") DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if users were synced successfully
SELECT 
  COUNT(*) as total_users,
  COUNT("supabaseId") as synced_users
FROM public."User";

-- View synced users
SELECT 
  id,
  "supabaseId",
  email,
  name,
  "createdAt"
FROM public."User"
ORDER BY "createdAt" DESC;
