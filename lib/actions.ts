"use server";

import { revalidatePath } from "next/cache";
import { db, COMPANY_ID } from "./supabase";
import { cancellationQuote } from "./policy";
import type { Order } from "./types";

export type ActionResult = { ok: true; message: string } | { ok: false; message: string };

async function load(orderNumber: string): Promise<Order> {
  const { data, error } = await db().from("orders").select("*").eq("company_id", COMPANY_ID).eq("order_number", orderNumber).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error(`Order ${orderNumber} not found.`);
  return data as Order;
}

async function update(orderNumber: string, patch: Partial<Order>) {
  const { error } = await db().from("orders").update(patch).eq("company_id", COMPANY_ID).eq("order_number", orderNumber);
  if (error) throw new Error(error.message);
}

function done(message: string): ActionResult {
  revalidatePath("/", "layout");
  return { ok: true, message };
}

async function run(fn: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await fn();
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Something went wrong." };
  }
}

/** pending/quoted -> confirmed (Booked). */
export async function confirmOrder(orderNumber: string) {
  return run(async () => {
    const o = await load(orderNumber);
    if (!["pending", "quoted"].includes(o.status)) return { ok: false, message: `Order is ${o.status}, can't confirm.` };
    await update(orderNumber, { status: "confirmed" });
    return done(`Order ${orderNumber} booked.`);
  });
}

/** Assign (or reassign) a driver. Confirms the order if it wasn't yet. */
export async function assignDriver(orderNumber: string, driverId: string) {
  return run(async () => {
    const o = await load(orderNumber);
    if (!["pending", "quoted", "confirmed"].includes(o.status)) return { ok: false, message: `Order is ${o.status}, can't assign a driver.` };
    const { data: drv, error } = await db().from("drivers").select("driver_id,full_name,vehicle_class,active").eq("driver_id", driverId).eq("company_id", COMPANY_ID).maybeSingle();
    if (error) throw new Error(error.message);
    if (!drv) return { ok: false, message: "Driver not found." };
    await update(orderNumber, { assigned_driver_id: drv.driver_id, vehicle_class: drv.vehicle_class, status: "confirmed" });
    return done(`${drv.full_name} assigned to order ${orderNumber}.`);
  });
}

export async function unassignDriver(orderNumber: string) {
  return run(async () => {
    const o = await load(orderNumber);
    if (o.status !== "confirmed") return { ok: false, message: "Only booked orders can be unassigned." };
    await update(orderNumber, { assigned_driver_id: null });
    return done(`Driver removed from order ${orderNumber}.`);
  });
}

/** confirmed + driver -> in_transit. */
export async function markPickedUp(orderNumber: string) {
  return run(async () => {
    const o = await load(orderNumber);
    if (o.status !== "confirmed") return { ok: false, message: `Order is ${o.status}, can't mark picked up.` };
    if (!o.assigned_driver_id) return { ok: false, message: "Assign a driver first." };
    await update(orderNumber, { status: "in_transit" });
    return done(`Order ${orderNumber} picked up and in transit.`);
  });
}

/** in_transit -> delivered (with proof of delivery). */
export async function markDelivered(orderNumber: string) {
  return run(async () => {
    const o = await load(orderNumber);
    if (o.status !== "in_transit") return { ok: false, message: `Order is ${o.status}, can't mark delivered.` };
    const now = new Date().toISOString();
    await update(orderNumber, { status: "delivered", actual_delivery_timestamp: now, pod_submitted: true, pod_submitted_at: now } as Partial<Order>);
    return done(`Order ${orderNumber} delivered.`);
  });
}

/** Cancel per company policy; fee is computed server-side. */
export async function cancelOrder(orderNumber: string) {
  return run(async () => {
    const o = await load(orderNumber);
    const q = cancellationQuote(o);
    if (!q.allowed) return { ok: false, message: q.reason };
    await update(orderNumber, { status: "cancelled", cancellation_fee_cad: q.fee, cancelled_at: new Date().toISOString(), cancelled_via: "dashboard" });
    return done(q.fee > 0 ? `Order ${orderNumber} cancelled. Fee: $${q.fee.toFixed(2)}.` : `Order ${orderNumber} cancelled at no charge.`);
  });
}
