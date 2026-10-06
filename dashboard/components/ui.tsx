import { cn } from "@/lib/utils";
import { CHANNEL_LABEL, STATUS_LABEL } from "@/lib/format";
import { Phone, MessageCircle, Globe, Mail, type LucideIcon } from "lucide-react";

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200/70 bg-white/70 px-6 pt-16 pb-5 backdrop-blur sm:flex-row sm:items-end sm:justify-between lg:px-10 lg:pt-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("card", className)}>{children}</section>;
}

export function CardHeader({ title, hint, right }: { title: string; hint?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
      {right}
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700 ring-slate-200",
  quoted: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-brand-50 text-brand-700 ring-brand-200",
  in_transit: "bg-violet-50 text-violet-700 ring-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset", className)}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={STATUS_STYLE[status] ?? STATUS_STYLE.pending}>{STATUS_LABEL[status] ?? status}</Badge>;
}

export const CHANNEL_ICON: Record<string, LucideIcon> = { phone: Phone, whatsapp: MessageCircle, web_form: Globe, email: Mail };
const CHANNEL_STYLE: Record<string, string> = {
  phone: "bg-sky-50 text-sky-700 ring-sky-200",
  whatsapp: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  web_form: "bg-slate-100 text-slate-600 ring-slate-200",
  email: "bg-orange-50 text-orange-700 ring-orange-200",
};

export function ChannelBadge({ channel }: { channel: string | null }) {
  const c = channel ?? "web_form";
  const Icon = CHANNEL_ICON[c] ?? Globe;
  return (
    <Badge className={CHANNEL_STYLE[c] ?? CHANNEL_STYLE.web_form}>
      <Icon className="size-3" /> {CHANNEL_LABEL[c] ?? c}
    </Badge>
  );
}

export function Stat({ label, value, sub, icon: Icon, tone = "brand" }: { label: string; value: string; sub?: React.ReactNode; icon: LucideIcon; tone?: "brand" | "emerald" | "violet" | "rose" | "amber" | "sky" }) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className={cn("grid size-8 place-items-center rounded-lg", tones[tone])}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-slate-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-sm font-medium text-slate-700">{title}</div>
      {hint && <div className="mt-1 max-w-sm text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-500", className)}>{children}</th>;
}
export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-5 py-3 align-top text-sm text-slate-700", className)}>{children}</td>;
}
