import type { Order } from "./types";

/**
 * Acme cancellation policy (same rules the WhatsApp bot and voice agent use):
 * free before a driver is assigned, $10 once a driver is assigned,
 * full price once in transit; delivered orders can't be cancelled.
 */
export function cancellationQuote(o: Pick<Order, "status" | "assigned_driver_id" | "quoted_price_cad">): {
  allowed: boolean;
  fee: number;
  reason: string;
} {
  if (o.status === "delivered") return { allowed: false, fee: 0, reason: "Delivered orders can't be cancelled." };
  if (o.status === "cancelled") return { allowed: false, fee: 0, reason: "Already cancelled." };
  if (o.status === "in_transit") return { allowed: true, fee: Number(o.quoted_price_cad ?? 0), reason: "In transit: full price applies." };
  if (o.assigned_driver_id) return { allowed: true, fee: 10, reason: "Driver assigned: $10 fee applies." };
  return { allowed: true, fee: 0, reason: "No driver assigned yet: free cancellation." };
}
