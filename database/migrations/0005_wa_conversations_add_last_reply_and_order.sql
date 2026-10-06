-- Context for follow-ups ("sure", "thanks", "cancel it"): the bot's last reply and last order.
alter table public.wa_conversations
  add column if not exists last_bot_reply text,
  add column if not exists last_order_number text;
