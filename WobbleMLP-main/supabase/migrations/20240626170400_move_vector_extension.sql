-- 2. Move vector extension to a dedicated schema if it exists
CREATE SCHEMA IF NOT EXISTS extensions;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    ALTER EXTENSION vector SET SCHEMA extensions;
  END IF;
END $$;
