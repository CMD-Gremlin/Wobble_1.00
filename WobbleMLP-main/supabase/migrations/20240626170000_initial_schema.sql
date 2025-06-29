-- Create tables
create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  html text not null,
  script text not null,
  visibility text not null default 'private' check (visibility in ('private', 'unlisted', 'public')),
  price numeric not null default 0,
  paid_only boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create tool_versions table
create table if not exists public.tool_versions (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid references public.tools(id) on delete cascade not null,
  html text not null,
  script text not null,
  created_at timestamptz default now()
);

-- Create index for better performance
create index if not exists idx_tool_versions_tool_id on public.tool_versions(tool_id);
create index if not exists idx_tools_user_id on public.tools(user_id);

-- Create updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for tools.updated_at
create or replace trigger update_tools_updated_at
before update on public.tools
for each row execute function public.update_updated_at_column();

-- Enable RLS
alter table public.tools enable row level security;
alter table public.tool_versions enable row level security;

-- Create policies for tools
create policy "Users can view their own tools"
  on public.tools for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tools"
  on public.tools for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tools"
  on public.tools for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tools"
  on public.tools for delete
  using (auth.uid() = user_id);

-- Create policies for tool_versions
create policy "Users can view versions of their tools"
  on public.tool_versions for select
  using (exists (
    select 1 from public.tools 
    where id = tool_versions.tool_id and user_id = auth.uid()
  ));

create policy "Users can insert versions for their tools"
  on public.tool_versions for insert
  with check (exists (
    select 1 from public.tools 
    where id = tool_versions.tool_id and user_id = auth.uid()
  ));

-- Allow public access to public tools
create policy "Public tools are viewable by everyone"
  on public.tools for select
  using (visibility = 'public');

-- Create function to get current user's tools
create or replace function public.get_my_tools()
returns setof public.tools
language sql
security definer
as $$
  select * from public.tools where user_id = auth.uid();
$$;
