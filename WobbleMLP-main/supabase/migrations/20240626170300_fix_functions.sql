-- 1. Fix function search paths and security

-- Drop dependent triggers first
DROP TRIGGER IF EXISTS update_tools_updated_at ON public.tools CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.record_usage(
  p_tool_id uuid,
  p_endpoint text,
  p_method text,
  p_status_code integer,
  p_response_size_bytes integer,
  p_duration_ms integer
) CASCADE;

DROP FUNCTION IF EXISTS public.get_my_tools() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.reset_quota() CASCADE;

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
