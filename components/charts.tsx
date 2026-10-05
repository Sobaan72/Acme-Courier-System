"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export const CHANNEL_COLORS: Record<string, string> = { phone: "#0ea5e9", whatsapp: "#10b981", web_form: "#94a3b8", email: "#f97316" };
const CHANNEL_NAMES: Record<string, string> = { phone: "Voice AI", whatsapp: "WhatsApp", web_form: "Web form", email: "Email" };

const tooltipStyle = {
  contentStyle: { borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 10px 30px -12px rgba(15,23,42,.25)", fontSize: 12 },
  labelStyle: { color: "#0f172a", fontWeight: 600, marginBottom: 4 },
};

export function OrdersAreaChart({ data }: { data: Array<Record<string, number | string>> }) {
  const keys = ["phone", "whatsapp", "web_form", "email"];
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          {keys.map((k) => (
            <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHANNEL_COLORS[k]} stopOpacity={0.35} />
              <stop offset="100%" stopColor={CHANNEL_COLORS[k]} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
        <Tooltip {...tooltipStyle} formatter={(v, n) => [v as number, CHANNEL_NAMES[n as string] ?? n]} />
        {keys.map((k) => (
          <Area key={k} type="monotone" dataKey={k} stackId="1" stroke={CHANNEL_COLORS[k]} strokeWidth={2} fill={`url(#g-${k})`} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ChannelDonut({ data }: { data: { key: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex items-center gap-6">
      <div className="relative size-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="key" innerRadius={52} outerRadius={76} paddingAngle={2} stroke="none">
              {data.map((d) => <Cell key={d.key} fill={CHANNEL_COLORS[d.key] ?? "#cbd5e1"} />)}
            </Pie>
            <Tooltip {...tooltipStyle} formatter={(v, n) => [v as number, CHANNEL_NAMES[n as string] ?? n]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-xl font-semibold tabular-nums">{total}</div>
            <div className="text-[11px] text-slate-500">orders</div>
          </div>
        </div>
      </div>
      <ul className="flex-1 space-y-2.5">
        {data.map((d) => (
          <li key={d.key} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 rounded-full" style={{ background: CHANNEL_COLORS[d.key] }} />
            <span className="text-slate-600">{CHANNEL_NAMES[d.key] ?? d.key}</span>
            <span className="ml-auto font-medium tabular-nums">{d.value}</span>
            <span className="w-10 text-right text-xs text-slate-400 tabular-nums">{total ? Math.round((d.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HoursBar({ data }: { data: { hour: string; orders: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} interval={2} />
        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "#f1f5f9" }} />
        <Bar dataKey="orders" radius={[6, 6, 0, 0]} fill="#4a72f5" />
      </BarChart>
    </ResponsiveContainer>
  );
}
