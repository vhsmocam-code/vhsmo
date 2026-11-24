-- Cash on Delivery support. Run once in the Supabase SQL editor.
-- Safe to re-run: every statement is idempotent.

-- 1. Orders: how the order is paid, and the COD fee charged on it.
alter table public.orders_v2
  add column if not exists payment_method text not null default 'prepaid',
  add column if not exists cod_fee numeric not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_v2_payment_method_check'
  ) then
    alter table public.orders_v2
      add constraint orders_v2_payment_method_check
      check (payment_method in ('prepaid', 'cod'));
  end if;
end $$;

create index if not exists orders_v2_cod_phone_idx
  on public.orders_v2 (phone, created_at)
  where payment_method = 'cod';

-- 2. Phone OTPs for COD. Message Central generates and checks the code; we keep
--    its verification id. code_hash is only used by the local dev fallback.
create table if not exists public.cod_otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  verification_id text,
  code_hash text,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  verified_at timestamptz,
  consumed_at timestamptz,
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists cod_otps_phone_created_idx on public.cod_otps (phone, created_at desc);
create index if not exists cod_otps_ip_created_idx on public.cod_otps (ip, created_at desc);

-- Only the server (service role) may touch OTPs.
alter table public.cod_otps enable row level security;

-- 2b. Email OTP: contact is an email by default, so phone is optional and
--     each row records its channel. (Idempotent - safe if table already exists.)
alter table public.cod_otps
  add column if not exists email text,
  add column if not exists channel text not null default 'sms',
  add column if not exists verification_id text,
  add column if not exists code_hash text;
alter table public.cod_otps alter column phone drop not null;
alter table public.cod_otps alter column code_hash drop not null;
create index if not exists cod_otps_email_created_idx on public.cod_otps (email, created_at desc);

-- 3. Check: payment_status must accept 'cod_confirmed'. This lists any check
--    constraint on orders_v2.payment_status - if one shows up, tell Claude.
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.orders_v2'::regclass
  and contype = 'c'
  and pg_get_constraintdef(oid) ilike '%payment_status%';
