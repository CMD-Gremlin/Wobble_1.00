create table tools (
  id text primary key,
  owner_id uuid references auth.users not null,
  current_version int default 1,
  created_at timestamptz default now()
);
alter table tools enable row level security;
create policy "owner can select" on tools
  for select using ( auth.uid() = owner_id );
