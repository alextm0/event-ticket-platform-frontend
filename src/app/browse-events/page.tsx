import { requireRole } from "@/lib/auth-guards";
import BrowseEventsClient from "@/components/events/BrowseEventsClient";

export default async function BrowseEventsPage() {
  await requireRole("attendee", { allowGrant: false });

  return <BrowseEventsClient />;
}