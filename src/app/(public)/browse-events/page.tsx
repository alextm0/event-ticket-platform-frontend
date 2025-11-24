import Link from "next/link";

import { requireRole } from "@/lib/auth-guards";
import { getPublishedEvents } from "@/lib/backend-client";
import { PublishedEvent } from "@/types";

export default async function BrowseEventsPage() {
  await requireRole("attendee", { allowGrant: false });

  let events: PublishedEvent[] = [];
  let error: string | null = null;

  try {
    events = await getPublishedEvents();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load events.";
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 text-slate-200">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-slate-50">Browse Events</h1>
        <p className="text-sm text-slate-400">
          Explore published events that are currently available.
        </p>
      </div>

      {error ? (
        <div className="rounded border border-rose-700/40 bg-rose-950/40 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : events.length === 0 ? (
        <p className="text-center text-slate-400">No published events are available right now.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <article
              key={event.id}
              className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-sm"
            >
              <div className="mb-4 space-y-1">
                <h2 className="text-xl font-semibold text-slate-50">{event.title}</h2>
                <p className="text-sm text-slate-400">{event.description}</p>
              </div>
              <dl className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Location</dt>
                  <dd className="font-medium text-slate-200">{event.location}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Date</dt>
                  <dd className="font-medium text-slate-200">
                    {new Date(event.startTime).toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Organizer</dt>
                  <dd className="font-medium text-slate-200">{event.organizerName ?? "TBD"}</dd>
                </div>
              </dl>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Link
                  href={`/events/${event.id}`}
                  className="rounded bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400"
                >
                  View details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}