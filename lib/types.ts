export type OrderStatus = "pending" | "quoted" | "confirmed" | "in_transit" | "delivered" | "cancelled";
export type Channel = "phone" | "whatsapp" | "web_form" | "email";

export interface Order {
  order_id: string;
  order_number: string;
  created_at: string;
  pickup_address: string | null;
  dropoff_address: string | null;
  package_weight_kg: number | null;
  package_size: string | null;
  service_tier: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  assigned_driver_id: string | null;
  vehicle_class: string | null;
  status: OrderStatus;
  quoted_price_cad: number | null;
  actual_delivery_timestamp: string | null;
  pod_submitted: boolean | null;
  intake_channel: Channel | null;
  cancellation_fee_cad: number | null;
  cancelled_at: string | null;
  cancelled_via: string | null;
}

export interface Driver {
  driver_id: string;
  full_name: string;
  phone: string | null;
  vehicle_class: string | null;
  active: boolean;
}

export interface CallLog {
  call_id: string;
  order_id: string | null;
  transcript: string | null;
  outcome: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface MissedCall {
  followup_id: string;
  customer_phone: string | null;
  call_id: string | null;
  reason: string | null;
  channel: string | null;
  status: string | null;
  error: string | null;
  created_at: string;
}

export interface Conversation {
  conversation_id: string;
  customer_phone: string;
  intent: string | null;
  slots: Record<string, unknown> | null;
  status: string;
  created_at: string;
  updated_at: string;
  last_bot_reply: string | null;
  last_order_number: string | null;
}

export interface IntentLog {
  log_id: string;
  customer_phone: string | null;
  message_text: string | null;
  classified_intent: string | null;
  reply_text: string | null;
  used_fallback_model: boolean | null;
  created_at: string;
}

export interface EmailLog {
  email_id: string;
  order_number: string | null;
  event: string | null;
  to_email: string | null;
  status: string | null;
  error: string | null;
  created_at: string;
}
