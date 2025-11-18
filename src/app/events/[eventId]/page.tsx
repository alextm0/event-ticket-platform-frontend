import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublishedEvent } from "@/lib/backend-client";

interface EventDetailsPageProps {
  params: {
    eventId: string;
  };
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { eventId } = params;

  try {
    const event = await getPublishedEvent(eventId);

    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-slate-200">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-sky-300">Published event</p>
          <h1 className="text-3xl font-semibold text-slate-50">{event.title}</h1>
          <p className="text-slate-400">{event.description}</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-lg font-semibold text-slate-100">Event details</h2>
            <dl className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex justify-between">
                <dt className="text-slate-400">Location</dt>
                <dd className="font-medium text-slate-100">{event.location}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Starts</dt>
                <dd className="font-medium text-slate-100">
                  {new Date(event.startTime).toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Ends</dt>
                <dd className="font-medium text-slate-100">
                  {new Date(event.endTime).toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Organizer</dt>
                <dd className="font-medium text-slate-100">{event.organizerName ?? "TBD"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-lg font-semibold text-slate-100">Ticket types</h2>
            {event.ticketTypes.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No ticket types are published for this event yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {event.ticketTypes.map((ticket) => (
                  <li key={ticket.id} className="rounded border border-slate-800 bg-slate-800/80 p-4">
                    <p className="text-sm font-semibold text-slate-100">{ticket.name}</p>
                    {ticket.description ? (
                      <p className="text-sm text-slate-400">{ticket.description}</p>
                    ) : null}
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>
                        Price:{" "}
                        {ticket.price !== undefined
                          ? `$${ticket.price.toFixed(2)}`
                          : "TBD"}
                      </span>
                      <span>
                        Remaining:{" "}
                        {ticket.remainingQuantity !== undefined
                          ? ticket.remainingQuantity
                          : "Unknown"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-10 flex items-center gap-3">
          <Link
            href="/browse-events"
            className="inline-flex items-center gap-1 text-sm font-medium text-sky-400 hover:text-sky-300"
          >
            <span aria-hidden="true">&lt;-</span> Back to browse events
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}

