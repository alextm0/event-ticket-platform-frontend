import { notFound } from "next/navigation";
import { getCurrentUserId, getStaffAssignedEvents } from "@/lib/backend-client";
import { requireRole } from "@/lib/auth-guards";
import { StaffScanClient } from "./StaffScanClient";

export default async function StaffScanPage() {
  await requireRole("staff", { allowGrant: false });

  const userId = await getCurrentUserId();
  if (!userId) {
    notFound();
  }

  let assignedEvents = [];
  try {
    assignedEvents = await getStaffAssignedEvents(userId);
  } catch (error) {
    console.error("Failed to fetch assigned events for staff:", error);
    // Continue with empty list, the UI will handle it
  }

  return <StaffScanClient initialEvents={assignedEvents} />;
}
