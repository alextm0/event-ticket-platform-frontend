export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
      <div className="flex flex-col items-center gap-4 text-[var(--color-secondary)]">
        <span className="relative inline-flex h-10 w-10">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)]/40" />
          <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-primary)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
          </span>
        </span>
        <p className="text-sm">Loading your workspace…</p>
      </div>
    </div>
  );
}
