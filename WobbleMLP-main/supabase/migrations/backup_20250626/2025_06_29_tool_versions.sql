CREATE TABLE IF NOT EXISTS tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  html text NOT NULL,
  script text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_tools_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
begin
  NEW.updated_at := now();
  return NEW;
end;
$$;

CREATE TRIGGER tools_updated_at
BEFORE UPDATE ON tools
FOR EACH ROW
EXECUTE PROCEDURE update_tools_updated_at();

ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_is_owner" ON tools
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS tool_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  html text NOT NULL,
  script text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tool_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON tool_versions
  USING (auth.uid() = (SELECT user_id FROM tools WHERE id = tool_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM tools WHERE id = tool_id));
