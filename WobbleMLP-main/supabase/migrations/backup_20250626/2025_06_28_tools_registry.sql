create table if not exists tools (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  tool_name text not null,
  html text not null,
  script text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function update_tools_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger tools_updated_at
before update on tools
for each row
execute procedure update_tools_updated_at();
