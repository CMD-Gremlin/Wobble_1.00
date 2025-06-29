create table if not exists ai_plugins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  api_url text not null,
  input_schema jsonb not null,
  output_schema jsonb not null,
  method text not null default 'POST',
  visibility text not null default 'private',
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function update_ai_plugins_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger ai_plugins_updated_at
before update on ai_plugins
for each row execute procedure update_ai_plugins_updated_at();

alter table ai_plugins enable row level security;
create policy ai_plugins_select on ai_plugins
  for select using (
    visibility = 'public' or auth.uid() = created_by
  );
create policy ai_plugins_insert on ai_plugins
  for insert with check (auth.uid() = created_by);
create policy ai_plugins_update on ai_plugins
  for update using (auth.uid() = created_by);
