import Link from "next/link";
import { ArrowRight, Bot, CircleDollarSign, Mail, MessageCircle, Package, PhoneMissed, PhoneCall, Receipt, Ban, TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader, Card, CardHeader, Stat, StatusBadge, ChannelBadge, Empty } from "@/components/ui";
import { RangeTabs, RANGES, type RangeKey } from "@/components/range-tabs";
import { AutoRefresh } from "@/components/auto-refresh";
import { OrdersAreaChart, ChannelDonut, HoursBar } from "@/components/charts";
import { getOrdersSince, getCalls, getMissedCalls, getConversations, getEmails } from "@/lib/data";
import { cad, num, timeAgo, TIER_LABEL, STATUS_LABEL, shortAddr } from "@/lib/format";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Overview" };

const TZ = "America/Toronto";
const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });

function summarize(orders: Order[]) {
  const live = orders.filter((o) => o.status !== "cancelled");
  const revenue = live.filter((o) => ["confirmed", "in_transit", "delivered"].includes(o.status)).reduce((s, o) => s + Number(o.quoted_price_cad ?? 0), 0);
  const booked = live.filter((o) => ["confirmed", "in_transit", "delivered"].includes(o.status)).length;
  const cancelled = orders.filter((o) => o.status === "cancelled");
  const fees = cancelled.reduce((s, o) => s + Number(o.cancellation_fee_cad ?? 0), 0);
  const ai = orders.filter((o) => o.intake_channel === "phone" || o.intake_channel === "whatsapp").length;
  return {
    total: orders.length,
    revenue,
    booked,
    aov: booked ? revenue / booked : 0,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelRate: orders.length ? cancelled.length / orders.length : 0,
    fees,
    aiShare: orders.length ? ai / orders.length : 0,
  };
}

function Delta({ now, prev, invert = false }: { now: number; prev: number | null; invert?: boolean }) {
  if (prev == null) return null;
  if (prev === 0) return <span className="text-slate-400">no prior data</span>;
  const pct = ((now - prev) / prev) * 100;
  const up = pct >= 0;
  const good = invert ? !up : up;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={good ? "text-emerald-600" : "text-rose-600"}>
      <Icon className="mr-1 inline size-3" />
      {Math.abs(pct).toFixed(0)}% vs previous period
    </span>
  );
}

export default async function Overview({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const sp = await searchParams;
  const range = (RANGES.find((r) => r.key === sp.range)?.key ?? "90d") as RangeKey;
  const days = RANGES.find((r) => r.key === range)!.days;
  const since = days ? new Date(Date.now() - days * 864e5) : null;
  const prevSince = days ? new Date(Date.now() - 2 * days * 864e5) : null;

  const [all, calls, missed, convos, emails] = await Promise.all([
    getOrdersSince(prevSince ? prevSince.toISOString() : null),
    getCalls(500),
    getMissedCalls(500),
    getConversations(500),
    getEmails(500),
  ]);

  const inRange = since ? all.filter((o) => new Date(o.created_at) >= since) : all;
  const prevRange = since && prevSince ? all.filter((o) => new Date(o.created_at) < since) : null;
  const s = summarize(inRange);
  const p = prevRange ? summarize(prevRange) : null;

  // Daily series by channel
  const series = new Map<string, Record<string, number | string>>();
  const start = since ?? (inRange[0] ? new Date(inRange[0].created_at) : new Date());
  for (let d = new Date(start); d <= new Date(); d = new Date(d.getTime() + 864e5)) {
    const k = dayKey(d.toISOString());
    series.set(k, { label: new Date(d).toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: TZ }), phone: 0, whatsapp: 0, web_form: 0, email: 0 });
  }
  for (const o of inRange) {
    const row = series.get(dayKey(o.created_at));
    if (row) row[o.intake_channel ?? "web_form"] = Number(row[o.intake_channel ?? "web_form"] ?? 0) + 1;
  }

  const channels = ["phone", "whatsapp", "web_form", "email"].map((k) => ({ key: k, value: inRange.filter((o) => (o.intake_channel ?? "web_form") === k).length }));

  const hours = Array.from({ length: 24 }, (_, h) => ({ hour: `${h % 12 || 12}${h < 12 ? "a" : "p"}`, orders: 0 }));
  for (const o of inRange) {
    const h = Number(new Date(o.created_at).toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: TZ })) % 24;
    hours[h].orders++;
  }

  const tiers = Object.keys(TIER_LABEL).map((t) => {
    const rows = inRange.filter((o) => o.service_tier === t && o.status !== "cancelled");
    return { tier: t, count: rows.length, revenue: rows.reduce((x, o) => x + Number(o.quoted_price_cad ?? 0), 0) };
  });
  const tierMax = Math.max(1, ...tiers.map((t) => t.revenue));

  const statuses = ["pending", "quoted", "confirmed", "in_transit", "delivered", "cancelled"].map((st) => ({ st, n: inRange.filter((o) => o.status === st).length }));
  const statusMax = Math.max(1, ...statuses.map((x) => x.n));

  const inWin = (iso: string) => !since || new Date(iso) >= since;
  const ai = {
    calls: calls.filter((c) => inWin(c.created_at)).length,
    callOrders: calls.filter((c) => inWin(c.created_at) && c.outcome === "order_captured").length,
    missed: missed.filter((m) => inWin(m.created_at)).length,
    recovered: missed.filter((m) => inWin(m.created_at) && m.status === "sent").length,
    chats: convos.filter((c) => inWin(c.updated_at)).length,
    emails: emails.filter((e) => inWin(e.created_at) && e.status === "sent").length,
  };

  const recent = [...inRange].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 7);

  return (
    <>
      <PageHeader title="Overview" subtitle="Orders, revenue and AI agent activity across every channel.">
        <RangeTabs value={range} />
        <AutoRefresh seconds={20} />
      </PageHeader>

      <div className="space-y-6 px-6 py-6 lg:px-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Orders" value={num(s.total)} icon={Package} sub={<Delta now={s.total} prev={p?.total ?? null} />} />
          <Stat label="Booked revenue" value={cad(s.revenue, 0)} icon={CircleDollarSign} tone="emerald" sub={<Delta now={s.revenue} prev={p?.revenue ?? null} />} />
          <Stat label="Avg. order value" value={cad(s.aov)} icon={Receipt} tone="violet" sub={`${num(s.booked)} booked · ${num(s.delivered)} delivered`} />
          <Stat label="Handled by AI agents" value={`${Math.round(s.aiShare * 100)}%`} icon={Bot} tone="sky" sub="Voice AI + WhatsApp share of orders" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader title="Orders by channel" hint="Daily orders, stacked by intake channel" />
            <div className="px-3 pt-2 pb-4">
              {inRange.length ? <OrdersAreaChart data={[...series.values()]} /> : <Empty title="No orders in this period" hint="Try a longer range." />}
            </div>
          </Card>
          <Card>
            <CardHeader title="Channel mix" hint="Where orders come from" />
            <div className="p-5">
              <ChannelDonut data={channels} />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card>
            <CardHeader title="AI agents" hint="Activity in this period" />
            <ul className="divide-y divide-slate-100 px-5 pt-3 pb-2">
              {[
                { icon: PhoneCall, label: "Voice calls handled", v: ai.calls, sub: `${ai.callOrders} captured an order`, tone: "text-sky-600 bg-sky-50" },
                { icon: MessageCircle, label: "WhatsApp conversations", v: ai.chats, sub: "Active chats with the bot", tone: "text-emerald-600 bg-emerald-50" },
                { icon: PhoneMissed, label: "Missed-call follow-ups", v: ai.missed, sub: `${ai.recovered} delivered on WhatsApp`, tone: "text-amber-600 bg-amber-50" },
                { icon: Mail, label: "Emails sent", v: ai.emails, sub: "Confirmations and status updates", tone: "text-orange-600 bg-orange-50" },
              ].map(({ icon: Icon, label, v, sub, tone }) => (
                <li key={label} className="flex items-center gap-3 py-3">
                  <span className={`grid size-9 place-items-center rounded-xl ${tone}`}><Icon className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-800">{label}</div>
                    <div className="text-xs text-slate-500">{sub}</div>
                  </div>
                  <div className="text-lg font-semibold tabular-nums">{num(v)}</div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Pipeline" hint="Orders by current status" />
            <div className="space-y-3 p-5">
              {statuses.map(({ st, n }) => (
                <div key={st}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-slate-600">{STATUS_LABEL[st]}</span>
                    <span className="font-medium tabular-nums">{n}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${st === "delivered" ? "bg-emerald-500" : st === "cancelled" ? "bg-rose-400" : st === "in_transit" ? "bg-violet-500" : st === "confirmed" ? "bg-brand-500" : st === "quoted" ? "bg-amber-400" : "bg-slate-400"}`}
                      style={{ width: `${(n / statusMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl bg-rose-50/60 px-3 py-2 text-xs">
                <span className="flex items-center gap-1.5 text-rose-700"><Ban className="size-3.5" /> Cancellation rate {(s.cancelRate * 100).toFixed(1)}%</span>
                <span className="font-medium text-rose-700">{cad(s.fees)} in fees</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Revenue by service" hint="Excludes cancelled orders" />
            <div className="space-y-4 p-5">
              {tiers.map((t) => (
                <div key={t.tier}>
                  <div className="mb-1.5 flex items-baseline justify-between text-sm">
                    <span className="text-slate-700">{TIER_LABEL[t.tier]}</span>
                    <span className="font-medium tabular-nums">{cad(t.revenue, 0)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500" style={{ width: `${(t.revenue / tierMax) * 100}%` }} />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{t.count} orders</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader title="Latest orders" right={<Link href="/dispatch" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">Open dispatch <ArrowRight className="size-3.5" /></Link>} />
            <div className="mt-3 overflow-x-auto">
              {recent.length ? (
                <table className="w-full">
                  <tbody className="divide-y divide-slate-100">
                    {recent.map((o) => (
                      <tr key={o.order_id} className="hover:bg-slate-50/70">
                        <td className="py-3 pl-5 font-mono text-xs text-slate-500">#{o.order_number}</td>
                        <td className="px-3 py-3">
                          <div className="text-sm font-medium text-slate-800">{o.customer_name ?? "—"}</div>
                          <div className="max-w-[22rem] truncate text-xs text-slate-500">{shortAddr(o.pickup_address)} → {shortAddr(o.dropoff_address)}</div>
                        </td>
                        <td className="px-3 py-3"><ChannelBadge channel={o.intake_channel} /></td>
                        <td className="px-3 py-3"><StatusBadge status={o.status} /></td>
                        <td className="px-3 py-3 text-right text-sm font-medium tabular-nums">{cad(o.quoted_price_cad)}</td>
                        <td className="py-3 pr-5 text-right text-xs text-slate-500">{timeAgo(o.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <Empty title="No orders yet" />}
            </div>
          </Card>
          <Card>
            <CardHeader title="Busiest hours" hint="Orders by hour of day (Toronto time)" />
            <div className="px-3 pt-3 pb-4"><HoursBar data={hours} /></div>
          </Card>
        </div>
      </div>
    </>
  );
}
