import Link from "next/link";
import { cn } from "@/lib/utils";

export const RANGES = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
  { key: "all", label: "All time", days: null },
] as const;
export type RangeKey = (typeof RANGES)[number]["key"];

export function RangeTabs({ value, basePath = "/" }: { value: RangeKey; basePath?: string }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
      {RANGES.map((r) => (
        <Link
          key={r.key}
          href={`${basePath}?range=${r.key}`}
          className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition", value === r.key ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900")}
        >
          {r.label}
        </Link>
      ))}
    </div>
  );
}
