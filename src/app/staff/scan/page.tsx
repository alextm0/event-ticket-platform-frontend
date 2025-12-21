import { notFound } from "next/navigation";
import { getCurrentUserId, getStaffAssignedEvents } from "@/lib/backend-client";
import { requireRole } from "@/lib/auth-guards";
import { StaffScanClient } from "./StaffScanClient";
import { AssignedEvent } from "@/types";

export default async function StaffScanPage() {
  await requireRole("staff", { allowGrant: false });

  const userId = await getCurrentUserId();
  if (!userId) {
    notFound();
  }

  let assignedEvents: AssignedEvent[] = [];
  try {
    const events = await getStaffAssignedEvents(userId);
    assignedEvents = events || []; // Ensure it's always an array
  } catch (error) {
    console.error("Failed to fetch assigned events for staff:", error);
    // assignedEvents remains as empty array
  }

  return <StaffScanClient initialEvents={assignedEvents} />;
}
