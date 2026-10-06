import "server-only";
import { db, COMPANY_ID } from "./supabase";
import type { CallLog, Conversation, Driver, EmailLog, IntentLog, MissedCall, Order } from "./types";

const ORDER_COLS =
  "order_id,order_number,created_at,pickup_address,dropoff_address,package_weight_kg,package_size,service_tier,customer_name,customer_phone,customer_email,assigned_driver_id,vehicle_class,status,quoted_price_cad,actual_delivery_timestamp,pod_submitted,intake_channel,cancellation_fee_cad,cancelled_at,cancelled_via";

function must<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return (res.data ?? ([] as unknown as T)) as T;
}

export async function getDrivers(): Promise<Driver[]> {
  const res = await db().from("drivers").select("driver_id,full_name,phone,vehicle_class,active").eq("company_id", COMPANY_ID).order("full_name");
  return must(res, "drivers");
}

/** Orders for the dispatch board: all active orders plus the most recent finished ones. */
export async function getBoardOrders(): Promise<Order[]> {
  const sb = db();
  const [active, done, cancelled] = await Promise.all([
    sb.from("orders").select(ORDER_COLS).eq("company_id", COMPANY_ID).in("status", ["pending", "quoted", "confirmed", "in_transit"]).order("created_at", { ascending: false }).limit(600),
    sb.from("orders").select(ORDER_COLS).eq("company_id", COMPANY_ID).eq("status", "delivered").order("actual_delivery_timestamp", { ascending: false, nullsFirst: false }).limit(40),
    sb.from("orders").select(ORDER_COLS).eq("company_id", COMPANY_ID).eq("status", "cancelled").order("cancelled_at", { ascending: false, nullsFirst: false }).limit(40),
  ]);
  return [...must(active, "orders"), ...must(done, "orders"), ...must(cancelled, "orders")] as Order[];
}

/** Orders created since `sinceIso` (or all time), for analytics. Pages through results. */
export async function getOrdersSince(sinceIso: string | null): Promise<Order[]> {
  const sb = db();
  const out: Order[] = [];
  for (let from = 0; from < 20000; from += 1000) {
    let q = sb.from("orders").select(ORDER_COLS).eq("company_id", COMPANY_ID).order("created_at", { ascending: true }).range(from, from + 999);
    if (sinceIso) q = q.gte("created_at", sinceIso);
    const rows = must(await q, "orders") as Order[];
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}

export async function getCalls(limit = 200): Promise<CallLog[]> {
  const res = await db().from("call_logs").select("call_id,order_id,transcript,outcome,duration_seconds,created_at").eq("company_id", COMPANY_ID).order("created_at", { ascending: false }).limit(limit);
  return must(res, "call_logs");
}

export async function getMissedCalls(limit = 200): Promise<MissedCall[]> {
  const res = await db().from("missed_call_followups").select("followup_id,customer_phone,call_id,reason,channel,status,error,created_at").eq("company_id", COMPANY_ID).order("created_at", { ascending: false }).limit(limit);
  return must(res, "missed_call_followups");
}

export async function getConversations(limit = 200): Promise<Conversation[]> {
  const res = await db().from("wa_conversations").select("conversation_id,customer_phone,intent,slots,status,created_at,updated_at,last_bot_reply,last_order_number").eq("company_id", COMPANY_ID).order("updated_at", { ascending: false }).limit(limit);
  return must(res, "wa_conversations");
}

export async function getIntentLog(limit = 100): Promise<IntentLog[]> {
  const res = await db().from("wa_intent_review_log").select("log_id,customer_phone,message_text,classified_intent,reply_text,used_fallback_model,created_at").eq("company_id", COMPANY_ID).order("created_at", { ascending: false }).limit(limit);
  return must(res, "wa_intent_review_log");
}

export async function getEmails(limit = 100): Promise<EmailLog[]> {
  const res = await db().from("email_log").select("email_id,order_number,event,to_email,status,error,created_at").eq("company_id", COMPANY_ID).order("created_at", { ascending: false }).limit(limit);
  return must(res, "email_log");
}

export async function getOrdersByIds(ids: string[]): Promise<Pick<Order, "order_id" | "order_number" | "customer_name">[]> {
  if (!ids.length) return [];
  const res = await db().from("orders").select("order_id,order_number,customer_name").in("order_id", ids);
  return must(res, "orders");
}
