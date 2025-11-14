import { stackServerApp } from "@/stack/server";
import { backendClient } from "@/lib/backend-client";
import { EventForm } from "@/components/EventForm";
import { EventResponse } from "@/types";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const user = await stackServerApp.getUser();
  if (!user) {
    // Handle not logged in
    return <div>Please log in to edit an event.</div>;
  }

  const events = await backendClient.getEvents(user);
  const event = events.find((e: EventResponse) => e.id === params.id);

  if (!event) {
    return <div>Event not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-slate-100 mb-8">Edit Event</h1>
      <EventForm event={event} organizerId={user.clientReadOnlyMetadata.appUserId as string} />
    </div>
  );
}
