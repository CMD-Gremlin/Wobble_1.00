-- Fix RLS function calls to prevent re-evaluation for each row

-- Create a security definer function to get the current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'role';
$$;

-- Create a security definer function to get the current user ID
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

-- Drop and recreate tools policy with optimized function calls
DROP POLICY IF EXISTS "tools_access_policy" ON public.tools;
CREATE POLICY "tools_access_policy" ON public.tools
  USING (
    -- Service role bypasses all checks - evaluated once
    (SELECT public.current_user_role() = 'service_role') OR
    
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
    (user_id = (SELECT public.current_user_id()))
  );

-- Drop and recreate tool_versions policy with optimized function calls
DROP POLICY IF EXISTS "tool_versions_access_policy" ON public.tool_versions;
CREATE POLICY "tool_versions_access_policy" ON public.tool_versions
  USING (
    -- Service role bypasses all checks - evaluated once
    (SELECT public.current_user_role() = 'service_role') OR
    
    -- Allow access if user owns the parent tool
    EXISTS (
      SELECT 1 
      FROM public.tools t 
      WHERE t.id = tool_versions.tool_id 
      AND t.user_id = (SELECT public.current_user_id())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.tools t 
      WHERE t.id = tool_versions.tool_id 
      AND t.user_id = (SELECT public.current_user_id())
    )
  );

-- Drop and recreate usage policy with optimized function calls
DROP POLICY IF EXISTS "usage_access_policy" ON public.usage;
CREATE POLICY "usage_access_policy" ON public.usage
  USING (
    -- Service role bypasses all checks - evaluated once
    (SELECT public.current_user_role() = 'service_role') OR
    
    -- Allow users to see their own usage or admins to see all
    (
      (user_id = (SELECT public.current_user_id())) OR
      (SELECT public.is_admin())
    )
  )
  WITH CHECK (
    (
      (user_id = (SELECT public.current_user_id())) OR
      (SELECT public.is_admin())
    )
  );

-- Create index for the foreign key in usage table
CREATE INDEX IF NOT EXISTS idx_usage_tool_id ON public.usage(tool_id);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_id() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, service_role;
