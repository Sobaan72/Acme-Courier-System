export const cad = (n: number | null | undefined, digits = 2) =>
  n == null ? "—" : new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: digits, minimumFractionDigits: digits }).format(Number(n));

export const num = (n: number) => new Intl.NumberFormat("en-CA").format(n);

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export const dateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Toronto" }) : "—";

export const TIER_LABEL: Record<string, string> = {
  same_day_standard: "Same-Day Standard",
  same_day_express: "Same-Day Express",
  next_day: "Next Day",
};

export const SIZE_LABEL: Record<string, string> = { S: "Small", M: "Medium", L: "Large", XL: "Extra Large" };

export const CHANNEL_LABEL: Record<string, string> = {
  phone: "Voice AI",
  whatsapp: "WhatsApp",
  web_form: "Web form",
  email: "Email",
};

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  quoted: "Quoted",
  confirmed: "Booked",
  in_transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const VEHICLE_LABEL: Record<string, string> = { cargo_van: "Cargo van", motorcycle: "Motorcycle", e_bike: "E-bike" };

export const shortAddr = (a: string | null | undefined) => (a ? a.replace(/,?\s*(ON|Ontario)\b.*$/i, "").trim() : "—");

export const prettyPhone = (p: string | null | undefined) => {
  if (!p) return "—";
  const d = p.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return `+${d}`;
};

export const humanize = (s: string | null | undefined) => (s ? s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : "—");
