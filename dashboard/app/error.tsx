"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const hidden = /Minified React error|Server Components render/i.test(error.message);
  return (
    <div className="grid min-h-[60vh] place-items-center px-6">
      <div className="card max-w-md p-6 text-center">
        <div className="text-base font-semibold">Couldn&apos;t load this page</div>
        <p className="mt-2 text-sm text-slate-500">
          {hidden ? "The server couldn't load the data. Check the database settings and the hosting logs." : error.message}
        </p>
        {error.digest && <p className="mt-2 font-mono text-[11px] text-slate-400">Reference: {error.digest}</p>}
        <button onClick={reset} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Try again</button>
      </div>
    </div>
  );
}
