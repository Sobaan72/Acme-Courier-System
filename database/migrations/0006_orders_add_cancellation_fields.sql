-- Cancellation policy outcome: fee charged, when, and through which channel.
alter table public.orders
  add column if not exists cancellation_fee_cad numeric,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_via text;
