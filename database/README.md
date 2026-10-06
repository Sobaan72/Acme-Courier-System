# Database (Supabase / Postgres)

Run `migrations/` in order, then `seed.sql`.

| Table | Purpose |
|---|---|
| `companies` | Tenants. Every table carries `company_id`, so one deployment can serve several couriers |
| `orders` | Every order from every channel: route, package, service, price, status, driver, cancellation |
| `pricing_config` | Rate table: zone × size × service tier |
| `drivers` | Fleet: name, vehicle class, active |
| `wa_conversations` | WhatsApp conversation state per customer: intent, collected slots, last reply |
| `wa_intent_review_log` | Messages the AI couldn't place, for review |
| `call_logs` | Voice calls: transcript, outcome, duration |
| `missed_call_followups` | WhatsApp follow-ups after dropped calls |
| `email_log` | Every customer email and its delivery result |
| `knowledge_documents` | Knowledge-base articles the agents answer from |
| `integrations`, `invoices`, `failed_invoices` | Per-tenant integration config and invoicing (scaffold) |

Row-level security is enabled on every table. Only the server-side service role reads and writes.

`0007_order_events_to_n8n.sql` adds the event-bus trigger. Replace `<N8N_HOST>` and `<WEBHOOK_SECRET>`
before running it, and keep the secret in Supabase Vault in production.
