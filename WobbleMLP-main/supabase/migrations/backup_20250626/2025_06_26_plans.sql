create table plans (
  user_id uuid primary key references auth.users,
  stripe_customer text,
  tier text default 'free',
  renews_at timestamptz
);
