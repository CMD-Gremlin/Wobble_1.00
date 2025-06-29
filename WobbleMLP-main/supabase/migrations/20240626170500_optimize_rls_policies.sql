-- 3. Optimize RLS policies to avoid multiple evaluations and warnings

-- First, disable RLS on all tables to avoid permission issues
ALTER TABLE public.tools DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to ensure a clean slate
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Drop all policies on all tables
  FOR r IN 
    SELECT n.nspname, c.relname, pol.polname
    FROM pg_policy pol
    JOIN pg_class c ON pol.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                  r.polname, r.nspname, r.relname);
  END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to get the current user ID once
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;
$$;

-- Create a security definer function to check if user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid 
    AND raw_user_meta_data->>'role' = 'admin'
  );
$$;

-- Tools table policy - single policy for all operations
CREATE POLICY "tools_access_policy" ON public.tools
  USING (
    -- Service role bypasses all checks - evaluated once
    (SELECT current_setting('request.jwt.claims', true)::json->>'role' = 'service_role') OR
    
    -- For SELECT operations
    (
      (SELECT pg_trigger_depth() = 0) AND (
        (visibility = 'public') OR
        (user_id = (SELECT public.current_user_id()))
      )
    ) OR
    
    -- For write operations (INSERT/UPDATE/DELETE)
    (
      (SELECT pg_trigger_depth() > 0) AND
      (user_id = (SELECT public.current_user_id()))
    )
  )
  WITH CHECK (
    -- Only allow users to modify their own tools
    (user_id = (SELECT public.current_user_id()))
  );

-- Tool versions policy - single policy for all operations
CREATE POLICY "tool_versions_access_policy" ON public.tool_versions
  USING (
    -- Service role bypasses all checks - evaluated once
    (SELECT current_setting('request.jwt.claims', true)::json->>'role' = 'service_role') OR
    
    -- Allow access if user owns the parent tool
    EXISTS (
      SELECT 1 
      FROM public.tools t 
      WHERE t.id = tool_versions.tool_id 
      AND t.user_id = (SELECT public.current_user_id())
    )
  )
  WITH CHECK (
    -- Only allow users to modify versions of their own tools
    EXISTS (
      SELECT 1 
      FROM public.tools t 
      WHERE t.id = tool_versions.tool_id 
      AND t.user_id = (SELECT public.current_user_id())
    )
  );

-- Usage policy - single policy for all operations
CREATE POLICY "usage_access_policy" ON public.usage
  USING (
    -- Service role bypasses all checks - evaluated once
    (SELECT current_setting('request.jwt.claims', true)::json->>'role' = 'service_role') OR
    
    -- Allow users to see their own usage or admins to see all
    (
      (user_id = (SELECT public.current_user_id())) OR
      (SELECT public.is_admin())
    )
  )
  WITH CHECK (
    -- Only allow users to insert their own usage or admins to insert any
    (
      (user_id = (SELECT public.current_user_id())) OR
      (SELECT public.is_admin())
    )
  );

-- Grant necessary permissions
GRANT ALL ON FUNCTION public.current_user_id() TO authenticated, anon, service_role;
GRANT ALL ON FUNCTION public.is_admin() TO authenticated, anon, service_role;
