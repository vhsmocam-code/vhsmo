-- Early access codes (app filters): run in the Supabase SQL editor BEFORE
-- deploying /api/early-access/redeem. Safe to re-run.
--
-- Support operations (Table Editor):
--   * Turn a code off:            tick `locked`.
--   * Move a code to a new phone: clear `device_id` (the next redeem claims it).

-- 0. Sanity check - must return ZERO rows, otherwise fix duplicates before step 2
--    (two codes that only differ by case/spaces would collide once normalised).
select upper(trim(code)) as code, count(*)
from early_access_customers
where code is not null
group by 1
having count(*) > 1;

-- 1. The phone a code is tied to (null = not redeemed yet).
alter table early_access_customers
  add column if not exists device_id text;

-- 2. Codes are matched exactly by the API, which uppercases what people type.
update early_access_customers
   set code = upper(trim(code))
 where code is not null
   and code <> upper(trim(code));

-- 3. Only the service-role key (the website API) can read or write this table:
--    RLS on with no policies blocks the anon/authenticated keys entirely.
alter table early_access_customers enable row level security;

-- 4. Optional: give every row without a code one like VHS-7KQ2MP9X
--    (no I, L, O, 0 or 1, so codes are easy to read and type).
create or replace function gen_early_access_code() returns text
language sql volatile as $$
  select 'VHS-' || string_agg(
           substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::int, 1), '')
  from generate_series(1, 8);
$$;

update early_access_customers
   set code = gen_early_access_code()
 where code is null;

-- Export the list to send out:
-- select name, email, code from early_access_customers order by created_at;
