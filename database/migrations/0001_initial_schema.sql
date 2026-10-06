-- =============================================================================
-- NEXORDIS DISPATCH INTELLIGENCE SUITE — MULTI-TENANT SCHEMA (Supabase/Postgres)
-- Phase 0 scaffold. Every table carries company_id and has RLS enabled from day
-- one, per the roadmap's core architectural rule (see roadmap 3.2, 6.1, 6.3).
-- =============================================================================

create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Tenant registry
-- -----------------------------------------------------------------------------
create table companies (
    company_id      uuid primary key default uuid_generate_v4(),
    slug            text unique not null,          -- e.g. 'acme-001'
    name            text not null,
    service_city    text not null,
    tone            text default 'professional',   -- professional / friendly / concise
    after_hours_handling text default 'capture_and_queue', -- voicemail / human_escalation / capture_and_queue
    escalation_phone text,
    business_hours_start time default '08:00',
    business_hours_end   time default '18:00',
    created_at      timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- Drivers
-- -----------------------------------------------------------------------------
create table drivers (
    driver_id       uuid primary key default uuid_generate_v4(),
    company_id      uuid not null references companies(company_id) on delete cascade,
    full_name       text not null,
    phone           text,
    vehicle_class   text not null check (vehicle_class in ('cargo_van','motorcycle','e_bike')),
    active          boolean default true,
    pay_rate_per_delivery numeric(10,2),
    created_at      timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- Pricing config — zone / weight / service-tier rate table, config-driven
-- -----------------------------------------------------------------------------
create table pricing_config (
    pricing_id      uuid primary key default uuid_generate_v4(),
    company_id      uuid not null references companies(company_id) on delete cascade,
    zone            int not null check (zone between 1 and 4),
    weight_class    text not null check (weight_class in ('S','M','L','XL')),
    service_tier    text not null check (service_tier in ('same_day_standard','same_day_express','next_day')),
    base_rate_cad   numeric(10,2) not null,
    tier_multiplier numeric(4,2) not null default 1.0,  -- standard 1.0 / express 1.6 / next_day 0.85
    unique (company_id, zone, weight_class, service_tier)
);

-- -----------------------------------------------------------------------------
-- Orders — the core operational table
-- -----------------------------------------------------------------------------
create table orders (
    order_id            uuid primary key default uuid_generate_v4(),
    company_id          uuid not null references companies(company_id) on delete cascade,
    created_at          timestamptz not null default now(),
    pickup_address       text not null,
    dropoff_address      text not null,
    package_weight_kg     numeric(6,2),
    package_size          text check (package_size in ('S','M','L','XL')),
    service_tier           text check (service_tier in ('same_day_standard','same_day_express','next_day')),
    customer_name          text not null,
    customer_phone         text,
    customer_email         text,
    assigned_driver_id     uuid references drivers(driver_id),
    vehicle_class           text,
    status                  text not null default 'pending'
                             check (status in ('pending','quoted','confirmed','in_transit','delivered','cancelled')),
    quoted_price_cad        numeric(10,2),
    actual_delivery_timestamp timestamptz,
    pod_submitted            boolean default false,
    pod_submitted_at         timestamptz,
    invoice_sent             boolean default false,
    invoice_sent_at          timestamptz,
    intake_channel            text check (intake_channel in ('phone','web_form','email','whatsapp'))
);
create index idx_orders_company on orders(company_id);
create index idx_orders_status on orders(company_id, status);

-- -----------------------------------------------------------------------------
-- Invoices
-- -----------------------------------------------------------------------------
create table invoices (
    invoice_id      uuid primary key default uuid_generate_v4(),
    company_id      uuid not null references companies(company_id) on delete cascade,
    order_id        uuid not null references orders(order_id) on delete cascade,
    amount_cad      numeric(10,2) not null,
    sent_at         timestamptz,
    pdf_url         text,
    created_at      timestamptz default now()
);
create index idx_invoices_company on invoices(company_id);

-- -----------------------------------------------------------------------------
-- Integrations — encrypted per-tenant credential vault
-- Actual secret VALUES should live in Doppler/Infisical, not raw in this table.
-- This table stores references/config, not plaintext secrets.
-- -----------------------------------------------------------------------------
create table integrations (
    integration_id   uuid primary key default uuid_generate_v4(),
    company_id       uuid not null references companies(company_id) on delete cascade,
    integration_type text not null,   -- 'twilio' | 'whatsapp' | 'onfleet' | 'quickbooks' | ...
    config_json      jsonb default '{}'::jsonb,
    secret_ref       text,            -- pointer to Doppler/Infisical secret, never the raw value
    created_at       timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- Call logs
-- -----------------------------------------------------------------------------
create table call_logs (
    call_id         uuid primary key default uuid_generate_v4(),
    company_id      uuid not null references companies(company_id) on delete cascade,
    order_id        uuid references orders(order_id),
    transcript      text,
    outcome         text,    -- 'order_captured' | 'escalated' | 'abandoned' | 'off_topic'
    duration_seconds int,
    created_at      timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- Failed invoices log (Phase 4 — fallback path per roadmap 7.1)
-- -----------------------------------------------------------------------------
create table failed_invoices (
    id              uuid primary key default uuid_generate_v4(),
    company_id      uuid not null references companies(company_id) on delete cascade,
    order_id        uuid references orders(order_id),
    error_message   text,
    retry_count     int default 0,
    created_at      timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- Knowledge documents — RAG metadata (Phase 2, paired with the WISMO bot)
-- Postgres is the source of truth for the document content; the actual vector
-- embeddings live in Pinecone (one index, one namespace per company_id), not
-- here. pinecone_vector_id links a row here to its vector in Pinecone. Scope is
-- deliberately limited to policy/FAQ/service-area grounding for the intake and
-- WISMO agents — the core order/quote/dispatch flow is structured extraction and
-- does not use RAG.
-- -----------------------------------------------------------------------------
create table knowledge_documents (
    doc_id              uuid primary key default uuid_generate_v4(),
    company_id          uuid not null references companies(company_id) on delete cascade,
    source_type         text not null check (source_type in ('policy','faq','service_area','other')),
    title               text not null,
    content             text not null,          -- raw source text, kept for audit + re-embedding
    pinecone_vector_id  text,                    -- id of the corresponding vector in Pinecone
    pinecone_namespace  text,                    -- expected to equal company_id::text
    is_active           boolean default true,    -- soft-disable a doc without deleting it
    created_at          timestamptz default now(),
    updated_at          timestamptz default now()
);
create index idx_knowledge_documents_company on knowledge_documents(company_id);

-- =============================================================================
-- ROW-LEVEL SECURITY — enforced at the database layer, not just in workflow logic
-- Assumes each n8n/service request authenticates as a role carrying a
-- company_id claim (via Supabase JWT custom claim or a service-role + explicit
-- filter, depending on how the intake layer authenticates). Adjust the claim
-- extraction below to match your actual auth setup before going live.
-- =============================================================================

alter table companies enable row level security;
alter table drivers enable row level security;
alter table pricing_config enable row level security;
alter table orders enable row level security;
alter table invoices enable row level security;
alter table integrations enable row level security;
alter table call_logs enable row level security;
alter table failed_invoices enable row level security;
alter table knowledge_documents enable row level security;

-- Example policy pattern (repeat per table, or generalize with a helper function):
-- create policy tenant_isolation_orders on orders
--   using (company_id = (auth.jwt() ->> 'company_id')::uuid);

-- NOTE: until per-tenant JWT claims are wired up (Phase 3), Phase 0-1 workflows
-- should use the Supabase service role key from within n8n only (never exposed
-- client-side), with explicit company_id filters in every query. RLS policies
-- become mandatory before onboarding client #2 (Phase 3 gate).

-- =============================================================================
-- Seed: Acme Courier Co. (Phase 0 synthetic reference company)
-- =============================================================================
insert into companies (slug, name, service_city, tone, escalation_phone)
values ('acme-001', 'Acme Courier Co.', 'Toronto, ON', 'professional', '+1-416-555-0100');
