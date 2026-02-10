import { requireRole } from "@/lib/auth-guards";
import { redirectIfAuthError } from "@/lib/auth-error-handler";
import { getEvents, getCurrentUserId } from "@/lib/backend-client";
import type { Event } from "@/types";
import OrganizerDashboardClient from "./OrganizerDashboardClient";

export default async function OrganizerDashboard() {
  await requireRole("organizer", { allowGrant: false });

  const organizerId = await getCurrentUserId();
  if (!organizerId) {
    throw new Error("No user ID available for organizer.");
  }

  let events: Event[] = [];
  try {
    events = (await getEvents({ organizerId })) ?? [];
  } catch (error) {
    redirectIfAuthError(error, "/organizer");
  }

  return <OrganizerDashboardClient initialEvents={events} />;
}
