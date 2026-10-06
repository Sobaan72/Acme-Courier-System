import { MessageCircle, Bot, Mail, Sparkles, ExternalLink } from "lucide-react";
import { PageHeader, Card, CardHeader, Stat, Badge, Empty, Th, Td } from "@/components/ui";
import { AutoRefresh } from "@/components/auto-refresh";
import { getConversations, getEmails, getIntentLog } from "@/lib/data";
import { HUBSPOT_PORTAL_ID } from "@/lib/supabase";
import { dateTime, humanize, num, prettyPhone, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Conversations" };

const INTENT_STYLE: Record<string, string> = {
  quote: "bg-amber-50 text-amber-700 ring-amber-200",
  book: "bg-brand-50 text-brand-700 ring-brand-200",
  status: "bg-violet-50 text-violet-700 ring-violet-200",
  cancel: "bg-rose-50 text-rose-700 ring-rose-200",
  faq: "bg-sky-50 text-sky-700 ring-sky-200",
};
const intentBadge = (i: string | null) => <Badge className={INTENT_STYLE[i ?? ""] ?? "bg-slate-100 text-slate-600 ring-slate-200"}>{i ? humanize(i) : "New"}</Badge>;

function parseSlots(v: unknown): Record<string, unknown> {
  if (!v) return {};
  if (typeof v === "string") { try { const o = JSON.parse(v); return o && typeof o === "object" ? o : {}; } catch { return {}; } }
  return typeof v === "object" ? (v as Record<string, unknown>) : {};
}

const SLOT_LABEL: Record<string, string> = {
  customer_name: "Name", pickup_address: "Pickup", dropoff_address: "Drop-off", package_size: "Size", service_tier: "Service", customer_email: "Email", order_number: "Order",
};

export default async function ConversationsPage() {
  const [convos, log, emails] = await Promise.all([getConversations(200), getIntentLog(60), getEmails(60)]);
  const real = convos.filter((c) => !c.customer_phone.startsWith("999"));
  const hs = (phone: string) => (HUBSPOT_PORTAL_ID ? `https://app.hubspot.com/contacts/${HUBSPOT_PORTAL_ID}/objects/0-1/views/all/list?query=${phone.replace(/\D/g, "").slice(-10)}` : null);

  return (
    <>
      <PageHeader title="Conversations" subtitle="What the WhatsApp agent is working on right now, and every message it has answered.">
        <AutoRefresh seconds={10} />
      </PageHeader>
      <div className="space-y-6 px-6 py-6 lg:px-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="WhatsApp customers" value={num(real.length)} icon={MessageCircle} tone="emerald" sub={`${convos.length - real.length} test conversations hidden from this count`} />
          <Stat label="Messages for review" value={num(log.length)} icon={Bot} tone="brand" sub="Off-topic or unclear messages the bot logged" />
          <Stat label="Fallback model used" value={num(log.filter((l) => l.used_fallback_model).length)} icon={Sparkles} tone="violet" sub="When the primary model was slow or down" />
          <Stat label="Emails sent" value={num(emails.filter((e) => e.status === "sent").length)} icon={Mail} tone="amber" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <Card className="xl:col-span-3">
            <CardHeader title="Live conversations" hint="Each customer's current request and what the bot has collected so far" />
            <div className="mt-3 divide-y divide-slate-100">
              {convos.length ? convos.map((c) => {
                const sl = parseSlots(c.slots);
                const slots = Object.entries(sl).filter(([k, v]) => SLOT_LABEL[k] && v != null && v !== "");
                const link = hs(c.customer_phone);
                return (
                  <div key={c.conversation_id} className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
                        {String(sl.customer_name ?? "").trim().charAt(0).toUpperCase() || "#"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                          {String(sl.customer_name || prettyPhone(c.customer_phone))}
                          {c.customer_phone.startsWith("999") && <Badge className="bg-slate-100 text-slate-500 ring-slate-200">Test</Badge>}
                        </div>
                        <div className="text-xs text-slate-500">{prettyPhone(c.customer_phone)} · active {timeAgo(c.updated_at)}{c.last_order_number ? ` · last order #${c.last_order_number}` : ""}</div>
                      </div>
                      {intentBadge(c.intent)}
                      {link && <a href={link} target="_blank" rel="noreferrer" title="Open in HubSpot" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600"><ExternalLink className="size-4" /></a>}
                    </div>
                    {slots.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 pl-12">
                        {slots.map(([k, v]) => (
                          <span key={k} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600"><span className="text-slate-400">{SLOT_LABEL[k]}:</span> {String(v)}</span>
                        ))}
                      </div>
                    )}
                    {c.last_bot_reply && (
                      <div className="mt-3 ml-12 rounded-xl rounded-tl-sm bg-emerald-50/70 px-3 py-2 text-[13px] leading-relaxed whitespace-pre-line text-slate-700 line-clamp-4">{c.last_bot_reply}</div>
                    )}
                  </div>
                );
              }) : <Empty title="No conversations yet" />}
            </div>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader title="Review queue" hint="Messages the AI flagged as off-topic or unclear, with its reply. Use these to improve the knowledge base." />
            <div className="scrollbar-thin mt-3 max-h-[52rem] divide-y divide-slate-100 overflow-y-auto">
              {log.length ? log.map((l) => (
                <div key={l.log_id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>{prettyPhone(l.customer_phone)}</span>
                    <span className="flex items-center gap-2">{intentBadge(l.classified_intent)} {timeAgo(l.created_at)}</span>
                  </div>
                  <div className="mt-1.5 text-sm text-slate-800">“{l.message_text}”</div>
                  {l.reply_text && <div className="mt-1.5 line-clamp-2 text-xs text-slate-500">↳ {l.reply_text}</div>}
                </div>
              )) : <Empty title="No messages logged yet" />}
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader title="Customer emails" hint="Booking confirmations and status updates sent automatically" />
          <div className="mt-3 overflow-x-auto">
            {emails.length ? (
              <table className="w-full">
                <thead className="border-y border-slate-100 bg-slate-50/60"><tr><Th>Order</Th><Th>Email</Th><Th>To</Th><Th>Status</Th><Th className="text-right">Sent</Th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {emails.map((e) => (
                    <tr key={e.email_id}>
                      <Td className="font-mono text-xs">#{e.order_number}</Td>
                      <Td>{humanize(e.event)}</Td>
                      <Td className="text-xs">{e.to_email ?? "—"}</Td>
                      <Td>
                        <Badge className={e.status === "sent" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : e.status === "failed" ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-slate-100 text-slate-600 ring-slate-200"}>{humanize(e.status)}</Badge>
                        {e.error && <div className="mt-1 max-w-xs text-[11px] text-slate-500">{e.error}</div>}
                      </Td>
                      <Td className="text-right text-xs text-slate-500">{dateTime(e.created_at)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <Empty title="No emails yet" />}
          </div>
        </Card>
      </div>
    </>
  );
}
