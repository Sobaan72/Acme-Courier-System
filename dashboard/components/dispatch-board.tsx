"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, X, MapPin, Flag, User, Phone, Mail, Package, Clock, Truck, CheckCircle2, Ban, ExternalLink, UserMinus, CircleCheck, Loader2, Filter } from "lucide-react";
import type { Driver, Order } from "@/lib/types";
import { cancellationQuote } from "@/lib/policy";
import { assignDriver, cancelOrder, confirmOrder, markDelivered, markPickedUp, unassignDriver, type ActionResult } from "@/lib/actions";
import { cad, dateTime, prettyPhone, shortAddr, SIZE_LABEL, TIER_LABEL, timeAgo, VEHICLE_LABEL, CHANNEL_LABEL } from "@/lib/format";
import { ChannelBadge, StatusBadge } from "@/components/ui";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

type ColKey = "new" | "ready" | "assigned" | "transit" | "delivered" | "cancelled";
const COLUMNS: { key: ColKey; title: string; hint: string; accent: string }[] = [
  { key: "new", title: "Awaiting booking", hint: "Pending and quoted", accent: "bg-amber-400" },
  { key: "ready", title: "Ready to dispatch", hint: "Booked, no driver", accent: "bg-brand-500" },
  { key: "assigned", title: "Driver assigned", hint: "Waiting for pickup", accent: "bg-sky-500" },
  { key: "transit", title: "In transit", hint: "Picked up", accent: "bg-violet-500" },
  { key: "delivered", title: "Delivered", hint: "Most recent", accent: "bg-emerald-500" },
  { key: "cancelled", title: "Cancelled", hint: "Most recent", accent: "bg-rose-400" },
];

function column(o: Order): ColKey {
  switch (o.status) {
    case "pending":
    case "quoted":
      return "new";
    case "confirmed":
      return o.assigned_driver_id ? "assigned" : "ready";
    case "in_transit":
      return "transit";
    case "delivered":
      return "delivered";
    default:
      return "cancelled";
  }
}

const PAGE = 30;

export function DispatchBoard({ orders, drivers, hubspotPortalId }: { orders: Order[]; drivers: Driver[]; hubspotPortalId: string }) {
  const [q, setQ] = useState("");
  const [channel, setChannel] = useState<string>("all");
  const [aiOnly, setAiOnly] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [limits, setLimits] = useState<Record<string, number>>({});
  const driverById = useMemo(() => new Map(drivers.map((d) => [d.driver_id, d])), [drivers]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (channel !== "all" && o.intake_channel !== channel) return false;
      if (aiOnly && !(o.intake_channel === "phone" || o.intake_channel === "whatsapp")) return false;
      if (!needle) return true;
      return [o.order_number, o.customer_name, o.customer_phone, o.pickup_address, o.dropoff_address].some((v) => v?.toLowerCase().includes(needle));
    });
  }, [orders, q, channel, aiOnly]);

  const grouped = useMemo(() => {
    const g: Record<ColKey, Order[]> = { new: [], ready: [], assigned: [], transit: [], delivered: [], cancelled: [] };
    for (const o of filtered) g[column(o)].push(o);
    return g;
  }, [filtered]);

  const open = openId ? orders.find((o) => o.order_id === openId) ?? null : null;
  const activeDrivers = drivers.filter((d) => d.active);
  const busy = new Set(orders.filter((o) => o.status === "confirmed" || o.status === "in_transit").map((o) => o.assigned_driver_id).filter(Boolean) as string[]);

  return (
    <div className="px-6 py-6 lg:px-10">
      {/* toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order #, name, phone, address"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </div>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
          {["all", "whatsapp", "phone", "web_form", "email"].map((c) => (
            <button key={c} onClick={() => setChannel(c)} className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition", channel === c ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900")}>
              {c === "all" ? "All channels" : CHANNEL_LABEL[c]}
            </button>
          ))}
        </div>
        <button onClick={() => setAiOnly((v) => !v)} className={cn("inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium shadow-sm transition", aiOnly ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600")}>
          <Filter className="size-3.5" /> AI-booked only
        </button>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <Truck className="size-3.5" /> {activeDrivers.length - [...busy].filter((id) => driverById.get(id)?.active).length} of {activeDrivers.length} drivers free
        </div>
      </div>

      {/* board */}
      <div className="scrollbar-thin -mx-6 flex gap-4 overflow-x-auto px-6 pb-4 lg:-mx-10 lg:px-10">
        {COLUMNS.map((col) => {
          const items = grouped[col.key];
          const limit = limits[col.key] ?? PAGE;
          return (
            <div key={col.key} className="flex w-[19rem] shrink-0 flex-col rounded-2xl bg-slate-100/70 p-2">
              <div className="flex items-center gap-2 px-2 pt-1.5 pb-3">
                <span className={cn("size-2 rounded-full", col.accent)} />
                <span className="whitespace-nowrap text-sm font-semibold text-slate-800">{col.title}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 tabular-nums shadow-sm">{items.length}</span>
                <span className="ml-auto truncate text-[11px] text-slate-400">{col.hint}</span>
              </div>
              <div className="scrollbar-thin flex max-h-[calc(100vh-15rem)] flex-col gap-2 overflow-y-auto pr-0.5">
                {items.slice(0, limit).map((o) => (
                  <OrderCard key={o.order_id} o={o} driver={o.assigned_driver_id ? driverById.get(o.assigned_driver_id) : undefined} onOpen={() => setOpenId(o.order_id)} />
                ))}
                {items.length > limit && (
                  <button onClick={() => setLimits((l) => ({ ...l, [col.key]: limit + PAGE }))} className="rounded-xl border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-500 hover:bg-white">
                    Show {Math.min(PAGE, items.length - limit)} more
                  </button>
                )}
                {!items.length && <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-xs text-slate-400">Nothing here</div>}
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <OrderSheet
          key={open.order_id + open.status + (open.assigned_driver_id ?? "")}
          o={open}
          drivers={activeDrivers}
          busy={busy}
          driver={open.assigned_driver_id ? driverById.get(open.assigned_driver_id) : undefined}
          hubspotPortalId={hubspotPortalId}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

function OrderCard({ o, driver, onOpen }: { o: Order; driver?: Driver; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="group w-full rounded-xl border border-slate-200/80 bg-white p-3 text-left shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition hover:-translate-y-px hover:border-brand-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-medium text-slate-500">#{o.order_number}</span>
        <ChannelBadge channel={o.intake_channel} />
      </div>
      <div className="mt-2 truncate text-sm font-semibold text-slate-900">{o.customer_name ?? "Unknown customer"}</div>
      <div className="mt-1.5 space-y-1 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 truncate"><MapPin className="size-3 shrink-0 text-slate-400" /> <span className="truncate">{shortAddr(o.pickup_address)}</span></div>
        <div className="flex items-center gap-1.5 truncate"><Flag className="size-3 shrink-0 text-slate-400" /> <span className="truncate">{shortAddr(o.dropoff_address)}</span></div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <span className="text-[11px] text-slate-500">{SIZE_LABEL[o.package_size ?? ""] ?? o.package_size} · {TIER_LABEL[o.service_tier ?? ""]?.replace("Same-Day ", "") ?? "—"}</span>
        <span className="text-sm font-semibold tabular-nums text-slate-900">{cad(o.quoted_price_cad)}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        {driver ? (
          <span className="flex items-center gap-1 text-sky-700"><Truck className="size-3" /> {driver.full_name}</span>
        ) : o.status === "cancelled" ? (
          <span className="text-rose-600">{Number(o.cancellation_fee_cad ?? 0) > 0 ? `Fee ${cad(o.cancellation_fee_cad)}` : "No fee"}{o.cancelled_via ? ` · via ${o.cancelled_via}` : ""}</span>
        ) : <span />}
        <span className="flex items-center gap-1"><Clock className="size-3" /> {timeAgo(o.status === "delivered" ? o.actual_delivery_timestamp ?? o.created_at : o.created_at)}</span>
      </div>
    </button>
  );
}

function OrderSheet({ o, driver, drivers, busy, hubspotPortalId, onClose }: { o: Order; driver?: Driver; drivers: Driver[]; busy: Set<string>; hubspotPortalId: string; onClose: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [which, setWhich] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string>(o.assigned_driver_id ?? "");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const policy = cancellationQuote(o);

  const act = (key: string, fn: () => Promise<ActionResult>) => {
    setWhich(key);
    start(async () => {
      const r = await fn();
      toast(r.ok, r.message);
      setWhich(null);
      setConfirmCancel(false);
    });
  };

  const steps = [
    { label: "Order created", at: o.created_at, done: true },
    { label: "Booked", at: null, done: ["confirmed", "in_transit", "delivered"].includes(o.status) },
    { label: driver ? `Driver assigned · ${driver.full_name}` : "Driver assigned", at: null, done: !!o.assigned_driver_id && o.status !== "cancelled" },
    { label: "Picked up · in transit", at: null, done: ["in_transit", "delivered"].includes(o.status) },
    { label: "Delivered", at: o.actual_delivery_timestamp, done: o.status === "delivered" },
  ];

  const hsLink = hubspotPortalId && o.customer_phone ? `https://app.hubspot.com/contacts/${hubspotPortalId}/objects/0-1/views/all/list?query=${encodeURIComponent(o.customer_phone.replace(/\D/g, "").slice(-10))}` : null;
  const Spinner = ({ k }: { k: string }) => (pending && which === k ? <Loader2 className="size-4 animate-spin" /> : null);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-slate-500">#{o.order_number}</span>
              <StatusBadge status={o.status} />
            </div>
            <h3 className="mt-1 text-lg font-semibold">{o.customer_name ?? "Unknown customer"}</h3>
            <div className="mt-1 flex items-center gap-2"><ChannelBadge channel={o.intake_channel} /><span className="text-xs text-slate-500">{dateTime(o.created_at)}</span></div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="size-5" /></button>
        </div>

        <div className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* route */}
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <span className="size-2.5 rounded-full border-2 border-brand-500" />
                <span className="my-1 w-px flex-1 bg-slate-200" />
                <span className="size-2.5 rounded-full bg-brand-500" />
              </div>
              <div className="flex-1 space-y-4 text-sm">
                <div><div className="text-[11px] uppercase tracking-wider text-slate-400">Pickup</div><div className="text-slate-800">{o.pickup_address ?? "—"}</div></div>
                <div><div className="text-[11px] uppercase tracking-wider text-slate-400">Drop-off</div><div className="text-slate-800">{o.dropoff_address ?? "—"}</div></div>
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Item icon={Package} k="Package" v={`${SIZE_LABEL[o.package_size ?? ""] ?? "—"}${o.package_weight_kg ? ` · ${o.package_weight_kg} kg` : ""}`} />
            <Item icon={Clock} k="Service" v={TIER_LABEL[o.service_tier ?? ""] ?? "—"} />
            <Item icon={Phone} k="Phone" v={prettyPhone(o.customer_phone)} />
            <Item icon={Mail} k="Email" v={o.customer_email ?? "—"} />
            <Item icon={User} k="Price" v={cad(o.quoted_price_cad)} />
            <Item icon={Truck} k="Vehicle" v={VEHICLE_LABEL[o.vehicle_class ?? ""] ?? "—"} />
          </dl>

          {/* timeline */}
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Progress</div>
            {o.status === "cancelled" ? (
              <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
                Cancelled {o.cancelled_at ? dateTime(o.cancelled_at) : ""}{o.cancelled_via ? ` via ${o.cancelled_via}` : ""}. Fee charged: <b>{cad(o.cancellation_fee_cad ?? 0)}</b>.
              </div>
            ) : (
              <ol className="space-y-3">
                {steps.map((s) => (
                  <li key={s.label} className="flex items-center gap-3 text-sm">
                    {s.done ? <CircleCheck className="size-4.5 text-emerald-500" /> : <span className="ml-0.5 size-3.5 rounded-full border-2 border-slate-300" />}
                    <span className={s.done ? "text-slate-800" : "text-slate-400"}>{s.label}</span>
                    {s.at && <span className="ml-auto text-xs text-slate-400">{dateTime(s.at)}</span>}
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* driver */}
          {["pending", "quoted", "confirmed"].includes(o.status) && (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Driver</div>
              <div className="flex gap-2">
                <select value={driverId} onChange={(e) => setDriverId(e.target.value)} className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100">
                  <option value="">Choose a driver…</option>
                  {drivers.map((d) => (
                    <option key={d.driver_id} value={d.driver_id}>
                      {d.full_name} · {VEHICLE_LABEL[d.vehicle_class ?? ""] ?? d.vehicle_class}{busy.has(d.driver_id) && d.driver_id !== o.assigned_driver_id ? " · on a job" : ""}
                    </option>
                  ))}
                </select>
                <button
                  disabled={!driverId || driverId === o.assigned_driver_id || pending}
                  onClick={() => act("assign", () => assignDriver(o.order_number, driverId))}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-40"
                >
                  <Spinner k="assign" /> {o.assigned_driver_id ? "Reassign" : "Assign"}
                </button>
              </div>
              {o.assigned_driver_id && o.status === "confirmed" && (
                <button onClick={() => act("unassign", () => unassignDriver(o.order_number))} disabled={pending} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800">
                  <UserMinus className="size-3.5" /> Remove driver
                </button>
              )}
            </div>
          )}

          {hsLink && (
            <a href={hsLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700">
              <ExternalLink className="size-3.5" /> Open customer in HubSpot
            </a>
          )}
        </div>

        {/* actions */}
        <div className="space-y-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          {confirmCancel ? (
            <div className="rounded-xl border border-rose-200 bg-white p-3">
              <div className="text-sm font-medium text-slate-800">Cancel order #{o.order_number}?</div>
              <div className="mt-0.5 text-xs text-slate-500">{policy.reason} Fee: <b className="text-slate-800">{cad(policy.fee)}</b></div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => act("cancel", () => cancelOrder(o.order_number))} disabled={pending} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-600 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50">
                  <Spinner k="cancel" /> Yes, cancel
                </button>
                <button onClick={() => setConfirmCancel(false)} className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Keep order</button>
              </div>
            </div>
          ) : (
            <>
              {(o.status === "pending" || o.status === "quoted") && (
                <Primary onClick={() => act("confirm", () => confirmOrder(o.order_number))} disabled={pending} icon={CheckCircle2} spin={<Spinner k="confirm" />}>Confirm booking</Primary>
              )}
              {o.status === "confirmed" && (
                <Primary onClick={() => act("pickup", () => markPickedUp(o.order_number))} disabled={pending || !o.assigned_driver_id} icon={Truck} spin={<Spinner k="pickup" />}>
                  {o.assigned_driver_id ? "Mark picked up" : "Assign a driver to pick up"}
                </Primary>
              )}
              {o.status === "in_transit" && (
                <Primary onClick={() => act("deliver", () => markDelivered(o.order_number))} disabled={pending} icon={CheckCircle2} spin={<Spinner k="deliver" />} tone="emerald">Mark delivered</Primary>
              )}
              {policy.allowed && (
                <button onClick={() => setConfirmCancel(true)} disabled={pending} className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50">
                  <Ban className="size-4" /> Cancel order {policy.fee > 0 ? `(${cad(policy.fee)} fee)` : "(free)"}
                </button>
              )}
              {!policy.allowed && <div className="text-center text-xs text-slate-500">{o.status === "delivered" ? `Delivered ${dateTime(o.actual_delivery_timestamp)}. Proof of delivery recorded.` : policy.reason}</div>}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function Item({ icon: Icon, k, v }: { icon: React.ComponentType<{ className?: string }>; k: string; v: string }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400"><Icon className="size-3" /> {k}</dt>
      <dd className="mt-0.5 truncate text-slate-800" title={v}>{v}</dd>
    </div>
  );
}

function Primary({ children, onClick, disabled, icon: Icon, spin, tone = "brand" }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; icon: React.ComponentType<{ className?: string }>; spin?: React.ReactNode; tone?: "brand" | "emerald" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white shadow-sm transition disabled:opacity-40",
        tone === "emerald" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-brand-600 hover:bg-brand-700",
      )}
    >
      {spin || <Icon className="size-4" />} {children}
    </button>
  );
}
