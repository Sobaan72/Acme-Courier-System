import { PhoneCall, PhoneMissed, Timer, ShoppingBag, ChevronDown } from "lucide-react";
import { PageHeader, Card, CardHeader, Stat, Badge, Empty, Th, Td } from "@/components/ui";
import { AutoRefresh } from "@/components/auto-refresh";
import { getCalls, getMissedCalls, getOrdersByIds } from "@/lib/data";
import { dateTime, humanize, num, prettyPhone, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Calls" };

const OUTCOME_STYLE: Record<string, string> = {
  order_captured: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  abandoned: "bg-amber-50 text-amber-700 ring-amber-200",
  escalated: "bg-violet-50 text-violet-700 ring-violet-200",
};
const FOLLOWUP_STYLE: Record<string, string> = {
  sent: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200",
  skipped: "bg-slate-100 text-slate-600 ring-slate-200",
};

const dur = (s: number | null) => (s == null ? "—" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);

export default async function CallsPage() {
  const [calls, missed] = await Promise.all([getCalls(200), getMissedCalls(200)]);
  const orders = await getOrdersByIds([...new Set(calls.map((c) => c.order_id).filter(Boolean) as string[])]);
  const orderNo = new Map(orders.map((o) => [o.order_id, o.order_number]));

  const captured = calls.filter((c) => c.outcome === "order_captured").length;
  const durations = calls.map((c) => c.duration_seconds).filter((d): d is number => d != null);
  const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const sent = missed.filter((m) => m.status === "sent").length;

  return (
    <>
      <PageHeader title="Calls" subtitle="Every call handled by the voice AI agent, plus WhatsApp follow-ups for calls that dropped.">
        <AutoRefresh seconds={15} />
      </PageHeader>
      <div className="space-y-6 px-6 py-6 lg:px-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Calls handled" value={num(calls.length)} icon={PhoneCall} tone="sky" />
          <Stat label="Orders captured" value={num(captured)} icon={ShoppingBag} tone="emerald" sub={calls.length ? `${Math.round((captured / calls.length) * 100)}% conversion` : undefined} />
          <Stat label="Avg. call length" value={dur(avg)} icon={Timer} tone="violet" />
          <Stat label="Missed-call follow-ups" value={num(missed.length)} icon={PhoneMissed} tone="amber" sub={`${sent} delivered on WhatsApp`} />
        </div>

        <Card>
          <CardHeader title="Call log" hint="Click a call to read the transcript" />
          <div className="mt-3 divide-y divide-slate-100">
            {calls.length ? calls.map((c) => (
              <details key={c.call_id} className="group">
                <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-3.5 hover:bg-slate-50/70">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600"><PhoneCall className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-slate-800">{c.transcript?.split("\n")[0]?.slice(0, 120) || "No transcript"}</div>
                    <div className="text-xs text-slate-500">{dateTime(c.created_at)} · {timeAgo(c.created_at)}</div>
                  </div>
                  {c.order_id && orderNo.get(c.order_id) && <span className="hidden font-mono text-xs text-slate-500 sm:inline">#{orderNo.get(c.order_id)}</span>}
                  <Badge className={OUTCOME_STYLE[c.outcome ?? ""] ?? "bg-slate-100 text-slate-600 ring-slate-200"}>{humanize(c.outcome)}</Badge>
                  <span className="w-12 text-right text-xs tabular-nums text-slate-500">{dur(c.duration_seconds)}</span>
                  <ChevronDown className="size-4 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <div className="bg-slate-50/70 px-5 py-4">
                  <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 font-sans text-[13px] leading-relaxed text-slate-700">{c.transcript || "No transcript recorded."}</pre>
                </div>
              </details>
            )) : <Empty title="No calls yet" hint="Calls appear here after the voice agent finishes them." />}
          </div>
        </Card>

        <Card>
          <CardHeader title="Missed-call recovery" hint="Callers who hung up or weren't served get a WhatsApp message (once per 24h, skipped if they booked)" />
          <div className="mt-3 overflow-x-auto">
            {missed.length ? (
              <table className="w-full">
                <thead className="border-y border-slate-100 bg-slate-50/60"><tr><Th>Caller</Th><Th>Reason</Th><Th>Follow-up</Th><Th>Detail</Th><Th className="text-right">When</Th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {missed.map((m) => (
                    <tr key={m.followup_id}>
                      <Td className="font-medium text-slate-800">{prettyPhone(m.customer_phone)}</Td>
                      <Td>{humanize(m.reason)}</Td>
                      <Td><Badge className={FOLLOWUP_STYLE[m.status ?? ""] ?? FOLLOWUP_STYLE.skipped}>{humanize(m.status)}</Badge></Td>
                      <Td className="max-w-md text-xs text-slate-500">{m.error ?? (m.status === "sent" ? "WhatsApp template delivered" : "—")}</Td>
                      <Td className="text-right text-xs text-slate-500">{dateTime(m.created_at)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <Empty title="No missed calls" />}
          </div>
        </Card>
      </div>
    </>
  );
}
