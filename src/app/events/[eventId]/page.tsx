import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublishedEvent, getEventTicketTypes } from "@/lib/backend-client";
import EventDetailsClient from "@/components/events/EventDetailsClient";

interface EventDetailsPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { eventId } = await params;

  try {
    const [event, ticketTypes] = await Promise.all([
      getPublishedEvent(eventId),
      getEventTicketTypes(eventId).catch(() => []),
    ]);

    if (!event) {
      notFound();
    }

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
            <EventDetailsClient eventId={eventId} ticketTypes={ticketTypes} />
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

