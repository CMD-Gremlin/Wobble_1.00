create table usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  tool_id text not null,
  ts timestamptz default now(),
  request_count int default 1,
  prompt_tokens int,
  completion_tokens int
);
alter table usage enable row level security;
create policy "own rows" on usage
  for select using ( auth.uid() = user_id );
