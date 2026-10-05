"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6">
      <div className="card max-w-md p-6 text-center">
        <div className="text-base font-semibold">Couldn't load this page</div>
        <p className="mt-2 text-sm text-slate-500">{error.message}</p>
        <button onClick={reset} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Try again</button>
      </div>
    </div>
  );
}
