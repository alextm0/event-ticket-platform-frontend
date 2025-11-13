
import Link from "next/link";
import { stackServerApp } from "@/stack/server";
import { getEvents } from "@/lib/backend-client";
import { EventResponse } from "@/types";

export default async function OrganizerDashboard() {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const events = await getEvents(user);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event: EventResponse) => (
          <div key={event.id} className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-100 mb-2">{event.title}</h2>
            <p className="text-slate-400 mb-4">{event.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">{event.location}</span>
              <span className="text-sm text-slate-500">{new Date(event.startTime).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
