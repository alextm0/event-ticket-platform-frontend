import TicketCard from "@/components/attendee/TicketCard";
import { requireRole } from "@/lib/auth-guards";

export default async function MyTicketsPage() {
  // ensure the visitor is an attendee (server-side guard)
  await requireRole("attendee", { allowGrant: false });

  // Fetch tickets on the server. Adjust the endpoint to your backend or
  // create an internal API route (e.g. /api/my-tickets) that returns the
  // authenticated user's tickets.
  let tickets: any[] = [];
  try {
    const res = await fetch('/api/my-tickets', { cache: 'no-store' });
    if (res.ok) {
      tickets = await res.json();
    }
  } catch (err) {
    // ignore and show empty state
    tickets = [];
  }

  return (
    <div>
      {tickets && tickets.length > 0 ? (
        tickets.map((ticket: any) => (
          <TicketCard key={String(ticket.id)} ticket={ticket} />
        ))
      ) : (
        <p>No tickets found.</p>
      )}
    </div>
  );
}