-- 1. Fix function search paths and security
DO $$
BEGIN
  -- Drop existing functions
  DROP FUNCTION IF EXISTS public.record_usage(
    p_tool_id uuid,
    p_endpoint text,
    p_method text,
    p_status_code integer,
    p_response_size_bytes integer,
    p_duration_ms integer
  );
  
  DROP FUNCTION IF EXISTS public.get_my_tools();
  DROP FUNCTION IF EXISTS public.update_updated_at_column();
  DROP FUNCTION IF EXISTS public.reset_quota();

  -- Recreate functions with proper search_path
  -- Update updated_at column function
  CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$;

  -- Get my tools function
  CREATE OR REPLACE FUNCTION public.get_my_tools()
  RETURNS SETOF public.tools
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
  AS $$
    SELECT * FROM public.tools WHERE user_id = (SELECT auth.uid());
  $$;

  -- Record usage function
  CREATE OR REPLACE FUNCTION public.record_usage(
    p_tool_id uuid,
    p_endpoint text,
    p_method text,
    p_status_code integer,
    p_response_size_bytes integer,
    p_duration_ms integer
  ) RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  BEGIN
    INSERT INTO public.usage (
      user_id,
      tool_id,
      endpoint,
      method,
      status_code,
      response_size_bytes,
      duration_ms
    ) VALUES (
      (SELECT auth.uid()),
      p_tool_id,
      p_endpoint,
      p_method,
      p_status_code,
      p_response_size_bytes,
      p_duration_ms
    );
  END;
  $$;
END $$;

-- 2. Move vector extension to a dedicated schema if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    CREATE SCHEMA IF NOT EXISTS extensions;
    ALTER EXTENSION vector SET SCHEMA extensions;
  END IF;
END $$;

-- 3. Optimize RLS policies to avoid multiple evaluations
DO $$
BEGIN
  -- Drop policies on tools table
  DROP POLICY IF EXISTS "Users can view their own tools" ON public.tools;
  DROP POLICY IF EXISTS "Users can insert their own tools" ON public.tools;
  DROP POLICY IF EXISTS "Users can update their own tools" ON public.tools;
  DROP POLICY IF EXISTS "Users can delete their own tools" ON public.tools;
  DROP POLICY IF EXISTS "Public tools are viewable by everyone" ON public.tools;
  
  -- Drop policies on tool_versions table
  DROP POLICY IF EXISTS "Users can view versions of their tools" ON public.tool_versions;
  DROP POLICY IF EXISTS "Users can insert versions for their tools" ON public.tool_versions;
  
  -- Drop policies on usage table
  DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage;
  DROP POLICY IF EXISTS "Admins can view all usage" ON public.usage;

  -- Recreate optimized policies
  -- Tools table policies
  CREATE POLICY "Users can manage their own tools" ON public.tools
    FOR ALL
    USING (user_id = (SELECT auth.uid()));
    
  CREATE POLICY "Public tools are viewable by everyone" ON public.tools
    FOR SELECT
    USING (visibility = 'public');

  -- Tool versions policies
  CREATE POLICY "Users can manage versions of their tools" ON public.tool_versions
    FOR ALL
    USING (EXISTS (
      SELECT 1 FROM public.tools 
      WHERE id = tool_versions.tool_id AND user_id = (SELECT auth.uid())
    ));

  -- Usage policies
  CREATE POLICY "Users can view their usage" ON public.usage
    FOR SELECT
    USING (user_id = (SELECT auth.uid()));
    
  CREATE POLICY "Admins can view all usage" ON public.usage
    FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = (SELECT auth.uid()) AND raw_user_meta_data->>'role' = 'admin'
    ));
END $$;
      p_endpoint,
      p_method,
      p_status_code,
      p_response_size_bytes,
      p_duration_ms
    );
  END;
  $$;
END $$;

-- 2. Move vector extension to a dedicated schema if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    CREATE SCHEMA IF NOT EXISTS extensions;
    ALTER EXTENSION vector SET SCHEMA extensions;
  END IF;
END $$;

-- 3. Optimize RLS policies to avoid multiple evaluations
-- First, drop existing policies
DO $$
BEGIN
  -- Drop policies on tools table
  DROP POLICY IF EXISTS "Users can view their own tools" ON public.tools;
  DROP POLICY IF EXISTS "Users can insert their own tools" ON public.tools;
  DROP POLICY IF EXISTS "Users can update their own tools" ON public.tools;
  DROP POLICY IF EXISTS "Users can delete their own tools" ON public.tools;
  DROP POLICY IF EXISTS "Public tools are viewable by everyone" ON public.tools;
  
  -- Drop policies on tool_versions table
  DROP POLICY IF EXISTS "Users can view versions of their tools" ON public.tool_versions;
  DROP POLICY IF EXISTS "Users can insert versions for their tools" ON public.tool_versions;
  
  -- Drop policies on usage table
  DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage;
  DROP POLICY IF EXISTS "Admins can view all usage" ON public.usage;

  -- Recreate optimized policies
  -- Tools table policies
  CREATE POLICY "Users can manage their own tools" ON public.tools
    FOR ALL
    USING (user_id = (SELECT auth.uid()));
    
  CREATE POLICY "Public tools are viewable by everyone" ON public.tools
    FOR SELECT
    USING (visibility = 'public');

  -- Tool versions policies
  CREATE POLICY "Users can manage versions of their tools" ON public.tool_versions
    FOR ALL
    USING (EXISTS (
      SELECT 1 FROM public.tools 
      WHERE id = tool_versions.tool_id AND user_id = (SELECT auth.uid())
    ));

  -- Usage policies
  CREATE POLICY "Users can view their usage" ON public.usage
    FOR SELECT
    USING (user_id = (SELECT auth.uid()));
    
  CREATE POLICY "Admins can view all usage" ON public.usage
    FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = (SELECT auth.uid()) AND raw_user_meta_data->>'role' = 'admin'
    ));
END $$;
