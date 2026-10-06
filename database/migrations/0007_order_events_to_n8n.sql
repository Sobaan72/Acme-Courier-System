-- Event bus: every new order and every status change is pushed to n8n (via pg_net),
-- which then syncs the HubSpot deal stage, emails the customer, etc.
-- Replace <N8N_HOST> and <WEBHOOK_SECRET> before running; keep the secret in Supabase Vault in production.
create extension if not exists pg_net with schema extensions;

create table if not exists public.email_log (
  email_id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(company_id),
  order_number text,
  event text not null,
  to_email text,
  status text not null,
  provider_message_id text,
  error text,
  created_at timestamptz not null default now()
);
alter table public.email_log enable row level security;

create or replace function public.notify_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    perform net.http_post(
      url := 'https://<N8N_HOST>/webhook/acme/order-status-changed',
      body := jsonb_build_object(
        'event', case when tg_op = 'INSERT' then 'created' else 'status_changed' end,
        'order_number', new.order_number,
        'old_status', case when tg_op = 'INSERT' then null else old.status end,
        'new_status', new.status,
        'company_id', new.company_id,
        'changed_at', now()
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-acme-secret', '<WEBHOOK_SECRET>'
      )
    );
  end if;
  return new;
end;
$$;

revoke all on function public.notify_order_status_change() from public, anon, authenticated;

drop trigger if exists orders_status_change_notify on public.orders;
create trigger orders_status_change_notify
  after update of status on public.orders
  for each row execute function public.notify_order_status_change();

drop trigger if exists orders_created_notify on public.orders;
create trigger orders_created_notify
  after insert on public.orders
  for each row execute function public.notify_order_status_change();
