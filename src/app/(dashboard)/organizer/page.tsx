import Link from "next/link";
import { requireRole } from "@/lib/auth-guards";
import { getEvents, getCurrentUserId } from "@/lib/backend-client";

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-slate-100">Organizer Dashboard</h1>
        <Link href="/organizer/create-event">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create Event
          </button>
        </Link>
      </div>
      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg mb-4">You haven't created any events yet.</p>
          <Link href="/organizer/create-event">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Create Your First Event
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event: any) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="bg-slate-800 rounded-lg p-6 transition-all hover:bg-slate-700 hover:shadow-lg hover:scale-105 cursor-pointer block"
            >
              <h2 className="text-xl font-semibold text-slate-100 mb-2">
                {event.title || event.name}
              </h2>
              <p className="text-slate-400 mb-4 line-clamp-2">{event.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Location:</span>
                  <span className="text-slate-300">{event.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Start:</span>
                  <span className="text-slate-300">
                    {event.startTime 
                      ? new Date(event.startTime).toLocaleDateString()
                      : event.date 
                      ? new Date(event.date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                {event.status && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      event.status === "PUBLISHED" 
                        ? "bg-green-500/20 text-green-400" 
                        : event.status === "DRAFT"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-slate-500/20 text-slate-400"
                    }`}>
                      {event.status}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
