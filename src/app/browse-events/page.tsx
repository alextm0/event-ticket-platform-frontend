import { PageHeader } from "@/components/ui/page-header";
import { getPublishedEvents } from "@/lib/backend-client";
import { PublishedEvent } from "@/types";
import BrowseEventsClient from "./BrowseEventsClient";

export const dynamic = "force-dynamic"; // Ensure fresh data

export default async function BrowseEventsPage() {
  // Public page, no role requirement

  let events: PublishedEvent[] = [];
  let error: string | null = null;

  try {
    events = await getPublishedEvents();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load events.";
  }

  return (
    <div className="min-h-screen w-full px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500">
        <PageHeader
          title="Browse Events"
          description="Discover and book tickets for upcoming events."
          className="items-center text-center md:flex-col md:items-center md:justify-center mb-8"
        />

        {error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-200 backdrop-blur-sm">
            <p>{error}</p>
          </div>
        ) : (
          <BrowseEventsClient initialEvents={events} />
        )}
      </div>
    </div>
  );
}