-- Create usage tracking table
create table if not exists public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  tool_id uuid references public.tools(id) on delete set null,
  endpoint text not null,
  method text not null,
  status_code integer not null,
  response_size_bytes integer,
  duration_ms integer,
  created_at timestamptz default now()
);

-- Create index for better performance
create index if not exists idx_usage_user_id on public.usage(user_id);
create index if not exists idx_usage_created_at on public.usage(created_at);

-- Enable RLS
alter table public.usage enable row level security;

-- Create policies for usage tracking
create policy "Users can view their own usage"
  on public.usage for select
  using (auth.uid() = user_id);

create policy "Admins can view all usage"
  on public.usage for select
  using (exists (
    select 1 from auth.users
    where id = auth.uid() and raw_user_meta_data->>'role' = 'admin'
  ));

-- Create function to record usage
create or replace function public.record_usage(
  p_tool_id uuid,
  p_endpoint text,
  p_method text,
  p_status_code integer,
  p_response_size_bytes integer,
  p_duration_ms integer
) returns void
language plpgsql
security definer
as $$
begin
  insert into public.usage (
    user_id,
    tool_id,
    endpoint,
    method,
    status_code,
    response_size_bytes,
    duration_ms
  ) values (
    auth.uid(),
    p_tool_id,
    p_endpoint,
    p_method,
    p_status_code,
    p_response_size_bytes,
    p_duration_ms
  );
end;
$$;
