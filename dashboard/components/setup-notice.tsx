export function SetupNotice() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6">
      <div className="card max-w-lg p-6">
        <div className="text-base font-semibold">Database not connected yet</div>
        <p className="mt-2 text-sm text-slate-600">
          Add <code className="rounded bg-slate-100 px-1">SUPABASE_URL</code> and{" "}
          <code className="rounded bg-slate-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> to the hosting environment
          (Vercel: Project Settings → Environment Variables), then redeploy. See <code className="rounded bg-slate-100 px-1">.env.example</code>.
        </p>
      </div>
    </div>
  );
}
