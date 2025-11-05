export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4 text-slate-300">
        <span className="relative inline-flex h-10 w-10">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500/40" />
          <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-sky-400">
            <span className="h-2 w-2 rounded-full bg-sky-300" />
          </span>
        </span>
        <p className="text-sm text-slate-400">Loading your workspace…</p>
      </div>
    </div>
  );
}
