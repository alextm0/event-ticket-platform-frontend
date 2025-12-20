import MyTicketsList from "@/components/attendee/MyTicketsList";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth-guards";
import { getUserTickets } from "@/lib/backend-client";

export default async function MyTicketsPage() {
  await requireRole("attendee", { allowGrant: false });

  let tickets: Ticket[] = [];
  try {
    tickets = await getUserTickets();
  } catch (error) {
    console.error("Failed to fetch user tickets:", error);
    // In a real app, we might redirect to sign-in if the error is 401, 
    // but requireRole should have caught that. 
    // If it's a backend error, we show an empty list or error state components.
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 text-slate-300">
      <PageHeader
        title="My tickets"
        description="Review your tickets, check their status, and access QR codes for entry."
      />

      <MyTicketsList tickets={tickets} />
    </div>
  );
}