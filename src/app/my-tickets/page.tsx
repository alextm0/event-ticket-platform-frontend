import MyTicketsList from "@/components/attendee/MyTicketsList";
import { requireRole } from "@/lib/auth-guards";
import { getUserTickets } from "@/lib/backend-client";

export default async function MyTicketsPage() {
  await requireRole("attendee", { allowGrant: false });
  const tickets = await getUserTickets();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 text-slate-300">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">My tickets</h1>
        <p className="mt-2 text-sm text-slate-400">
          Review your tickets, check their status, and access QR codes for entry.
        </p>
      </div>

      <MyTicketsList tickets={tickets} />
    </div>
  );
}