-- Missed-call recovery: one row per WhatsApp follow-up attempt after a dropped/unsuccessful call.
create table if not exists public.missed_call_followups (
  followup_id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(company_id),
  customer_phone text not null,
  call_id text,
  reason text,
  channel text not null default 'whatsapp',
  status text not null,          -- sent | failed | skipped
  provider_message_id text,
  error text,
  created_at timestamptz not null default now()
);
create index if not exists missed_call_followups_phone_idx on public.missed_call_followups (customer_phone, created_at desc);
alter table public.missed_call_followups enable row level security;
