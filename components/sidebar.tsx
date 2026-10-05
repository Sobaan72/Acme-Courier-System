"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Truck, PhoneCall, MessagesSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/dispatch", label: "Dispatch", icon: Truck },
  { href: "/calls", label: "Calls", icon: PhoneCall },
  { href: "/conversations", label: "Conversations", icon: MessagesSquare },
];

export function Sidebar({ company }: { company: string }) {
  const path = usePathname();
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink text-slate-300 lg:flex">
        <div className="flex items-center gap-3 px-5 pt-6 pb-8">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-violet-500 shadow-lg shadow-brand-500/30">
            <Sparkles className="size-4.5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-white">Nexordis</div>
            <div className="text-xs text-slate-400">Ops Console</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className={cn("size-4.5", active ? "text-brand-400" : "text-slate-500 group-hover:text-slate-300")} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">Workspace</div>
            <div className="mt-1 text-sm font-medium text-white">{company}</div>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
              <span className="live-dot size-1.5 rounded-full bg-emerald-400" /> AI agents online
            </div>
          </div>
        </div>
      </aside>
      {/* mobile top nav */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center gap-1 overflow-x-auto border-b border-white/10 bg-ink px-3 py-2 lg:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm", active ? "bg-white/10 text-white" : "text-slate-400")}>
              <Icon className="size-4" /> {label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
