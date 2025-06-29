-- Tool chaining and pricing updates
alter table tools
  add column if not exists visibility text not null default 'private',
  add column if not exists price numeric(10,2) default 0,
  add column if not exists paid_only boolean default false;

create table if not exists toolchains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  nodes jsonb not null,
  created_at timestamptz default now()
);

create table if not exists tool_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  tool_id uuid references tools(id) not null,
  purchased_at timestamptz default now()
);
