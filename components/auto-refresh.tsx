"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/** Re-fetches server data every `seconds` while the tab is visible. */
export function AutoRefresh({ seconds = 10 }: { seconds?: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [last, setLast] = useState(() => Date.now());
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        start(() => router.refresh());
        setLast(Date.now());
      }
    }, seconds * 1000);
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => { clearInterval(id); clearInterval(t); };
  }, [router, seconds]);

  const ago = Math.max(0, Math.round((Date.now() - last) / 1000));
  return (
    <button
      onClick={() => { start(() => router.refresh()); setLast(Date.now()); }}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
      title="Refresh now"
    >
      <span className="live-dot size-1.5 rounded-full bg-emerald-500 text-emerald-500" />
      Live · {pending ? "syncing" : `${ago}s ago`}
      <RefreshCw className={cn("size-3.5", pending && "animate-spin")} />
    </button>
  );
}
