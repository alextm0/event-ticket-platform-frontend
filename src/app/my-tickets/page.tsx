import MyTicketsList from "@/components/attendee/MyTicketsList";
import { requireRole } from "@/lib/auth-guards";

export default async function MyTicketsPage() {
    await requireRole("attendee", { allowGrant: false });

    return (
        <div>
            <MyTicketsList />
        </div>
    );
}