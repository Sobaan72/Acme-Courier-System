-- Learning loop: messages the classifier marked as off-topic/unclear are logged
-- for human review, so the knowledge base and prompts can be improved.
CREATE TABLE public.wa_intent_review_log (
  log_id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  company_id uuid REFERENCES public.companies(company_id),
  customer_phone text NOT NULL,
  message_text text NOT NULL,
  classified_intent text,
  reply_text text,
  used_fallback_model boolean NOT NULL DEFAULT false,
  primary_error text,
  reviewed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wa_intent_review_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access" ON public.wa_intent_review_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);
