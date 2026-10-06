-- WhatsApp conversation state: one row per customer, holding the intent and the
-- slots collected so far (pickup, drop-off, size, service, name, email...).
CREATE TABLE public.wa_conversations (
  conversation_id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES public.companies(company_id),
  customer_phone text NOT NULL,
  intent text,
  slots jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'collecting' CHECK (status = ANY (ARRAY['collecting'::text, 'completed'::text])),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, customer_phone)
);

CREATE INDEX wa_conversations_updated_at_idx ON public.wa_conversations (updated_at);

ALTER TABLE public.wa_conversations ENABLE ROW LEVEL SECURITY;
