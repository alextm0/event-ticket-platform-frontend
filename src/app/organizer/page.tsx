import Link from "next/link";
import { requireRole } from "@/lib/auth-guards";
import { getEvents, getCurrentUserId } from "@/lib/backend-client";
import { OrganizerEventCard } from "@/components/organizer/OrganizerEventCard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

export default async function OrganizerDashboard() {
  await requireRole("organizer", { allowGrant: false });

  // Get current organizer's user ID
  const organizerId = await getCurrentUserId();
  if (!organizerId) {
    throw new Error("No user ID available for organizer.");
  }

  // Fetch events for this organizer
  const events = await getEvents({ organizerId });

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Organizer Dashboard"
      >
        <Button asChild variant="mint">
          <Link href="/organizer/create-event">Create Event</Link>
        </Button>
      </PageHeader>
      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--color-secondary)] text-lg mb-6">You haven&apos;t created any events yet.</p>
          <Button asChild variant="mint">
            <Link href="/organizer/create-event">
              Create Your First Event
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <OrganizerEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
