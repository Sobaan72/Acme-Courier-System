# n8n workflow — "Nexordis Acme - Main Workflow"

One n8n workflow (113 nodes) runs every automated part of the system: the WhatsApp agent, the voice
agent's tools, pricing, bookings, order status, cancellations, HubSpot sync, customer emails and
missed-call recovery.

## Entry points

| Webhook | Called by | Does |
|---|---|---|
| `POST /webhook/acme/whatsapp` (+ `GET` for Meta verification) | WhatsApp Cloud API | The WhatsApp agent: parse → classify (Gemini + knowledge base) → enforce fields → quote / book / status / cancel / FAQ → reply |
| `POST /webhook/acme/get-quote` | Retell tool `get_quote` | Geocode → zone → rate table → price |
| `POST /webhook/acme/book-order` | Retell tool `book_order` | Create the order, then upsert the HubSpot contact and deal |
| `POST /webhook/acme/check-status` | Retell tool `check_order_status` | Look up by order number or phone |
| `POST /webhook/acme/cancel-order` | Retell cancellation tools + WhatsApp branch | Ownership check → cancellation policy → cancel and charge fee |
| `POST /webhook/acme/call-events` | Retell `call_analyzed` | Log the call, add a HubSpot call note, run missed-call recovery |
| `POST /webhook/acme/order-status-changed` | Postgres trigger (shared secret) | Move the HubSpot deal stage, send the status email |
| `POST /webhook/acme/embed-knowledge-doc` | Admin | Embed knowledge-base documents into a vector index (optional RAG path) |

Scheduled jobs clean up stale WhatsApp conversations, and a manual connectivity check tests every integration.

## Node mix

32 Code nodes (validation, slot enforcement, pricing, policy, message formatting) · 25 Supabase ·
19 HTTP (WhatsApp Graph API, HubSpot, Nominatim) · 11 If + 1 Switch (routing) · 3 Gemini · 9 webhooks ·
SMTP email.

## Importing

1. In n8n: **Workflows → Import from File** and choose `acme-main-workflow.json`.
2. Create these credentials and select them on the nodes that use them: **Supabase** (service role),
   **Google Gemini** (API key), **HubSpot App Token**, **SMTP**.
3. Replace the placeholders:
   - `<WEBHOOK_SECRET>`: the shared secret, the same value used in `database/migrations/0007_order_events_to_n8n.sql`
   - `<SECRET>` on the WhatsApp HTTP nodes: `Bearer <your WhatsApp Cloud API token>`
   - `<PHONE_NUMBER_ID>`: your WhatsApp business phone number ID
   - `<EMAIL>`: the sender address
   - `<PINECONE_INDEX_HOST>`: only if you use the embedding endpoint
4. HubSpot deal-stage IDs in the *Map Order Stage* code nodes belong to the demo portal's *Deliveries*
   pipeline. Replace them with your own pipeline's stage IDs.
5. Activate the workflow and point the Meta webhook and the Retell tool URLs at your n8n host.

All tokens, credential IDs, phone numbers and emails in this export have been replaced with placeholders.
