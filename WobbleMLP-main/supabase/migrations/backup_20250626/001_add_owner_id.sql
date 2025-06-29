alter table tools add column if not exists owner_id uuid references auth.users(id);
