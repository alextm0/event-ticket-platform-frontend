import Link from "next/link";
import { requireRole } from "@/lib/auth-guards";
import { PageHeader } from "@/components/ui/page-header";
import { getUserTickets } from "@/lib/backend-client";
import Ticket from "@/types/ticket-model";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import MyTicketsList from "@/components/attendee/MyTicketsList";

export default async function MyTicketsPage() {
  await requireRole("attendee", { allowGrant: false });

  let tickets: Ticket[] = [];
  let errorMsg: string | null = null;
  try {
    tickets = await getUserTickets();
  } catch (err: any) {
    console.error("Failed to fetch tickets", err);
    errorMsg = "We couldn't load your tickets. Please try again later.";
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <PageHeader
          title="My Tickets"
          description="Manage your tickets and access your events."
          className="mb-0"
        />
        <Button asChild variant="mint" className="md:self-start">
          <Link href="/browse-events">
            Browse Events <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <MyTicketsList tickets={tickets} error={errorMsg} />
    </div>
  );
}