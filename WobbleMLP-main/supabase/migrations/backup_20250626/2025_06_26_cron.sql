create or replace function reset_quota()
returns void
language plpgsql as $$
begin
  -- stub implementation
end;
$$;

create extension if not exists pg_cron;
select cron.schedule('nightly quota reset', '0 2 * * *', $$select reset_quota();$$);
