import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublishedEvent, getEventTicketTypes } from "@/lib/backend-client";

interface EventDetailsPageProps {
  params: {
    eventId: string;
  };
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { eventId } = params;

  try {
    const [event, ticketTypes] = await Promise.all([
      getPublishedEvent(eventId),
      getEventTicketTypes(eventId).catch(() => []), // Fallback to empty array if ticket types fail
    ]);

    const remainingQuantity = (ticketType: typeof ticketTypes[0]) => 
      ticketType.totalQuantity - ticketType.soldCount;

    return (
      <div className="mx-auto max-w-6xl px-4 py-8 text-slate-200">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-sky-500/20 px-3 py-1 text-xs font-medium text-sky-300">
              {event.status}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-slate-50">{event.title}</h1>
          <p className="text-lg text-slate-300">{event.description}</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Event Details Card */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-6 text-xl font-semibold text-slate-100">Event Details</h2>
              <dl className="space-y-4">
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <dt className="text-slate-400">Location</dt>
                  <dd className="text-right font-medium text-slate-100">{event.location}</dd>
                </div>
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <dt className="text-slate-400">Start Time</dt>
                  <dd className="text-right font-medium text-slate-100">
                    {new Date(event.startTime).toLocaleString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </dd>
                </div>
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <dt className="text-slate-400">End Time</dt>
                  <dd className="text-right font-medium text-slate-100">
                    {new Date(event.endTime).toLocaleString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </dd>
                </div>
                <div className="flex items-start justify-between">
                  <dt className="text-slate-400">Organizer</dt>
                  <dd className="text-right font-medium text-slate-100">
                    {event.organizerName ?? "TBD"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Ticket Types Card */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-6 text-xl font-semibold text-slate-100">Ticket Types</h2>
              {ticketTypes.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No ticket types available for this event yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {ticketTypes.map((ticketType) => {
                    const remaining = remainingQuantity(ticketType);
                    const isSoldOut = remaining <= 0;
                    const isInactive = !ticketType.active;

                    return (
                      <div
                        key={ticketType.id}
                        className={`rounded-lg border p-4 ${
                          isSoldOut || isInactive
                            ? "border-slate-700 bg-slate-800/50 opacity-60"
                            : "border-slate-800 bg-slate-800/80"
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-100">{ticketType.name}</h3>
                            {ticketType.description && (
                              <p className="mt-1 text-sm text-slate-400">
                                {ticketType.description}
                              </p>
                            )}
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-lg font-bold text-slate-50">
                              {ticketType.currency || "$"}
                              {ticketType.price.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-slate-700 pt-3 text-xs">
                          <div className="flex justify-between text-slate-400">
                            <span>Total Quantity:</span>
                            <span className="font-medium text-slate-300">
                              {ticketType.totalQuantity}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Sold:</span>
                            <span className="font-medium text-slate-300">
                              {ticketType.soldCount}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Remaining:</span>
                            <span
                              className={`font-medium ${
                                remaining <= 10
                                  ? "text-yellow-400"
                                  : remaining === 0
                                  ? "text-red-400"
                                  : "text-green-400"
                              }`}
                            >
                              {remaining}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              ticketType.active
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {ticketType.active ? "Active" : "Inactive"}
                          </span>
                          {isSoldOut && (
                            <span className="inline-flex items-center rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back Link */}
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

