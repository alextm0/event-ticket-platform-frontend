import { notFound, redirect } from "next/navigation";
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
    assignedEvents = events || [];
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("403") || msg.includes("401")) {
      redirect("/sign-in?session_expired=1&next=/staff/scan");
    }
    console.error("Failed to fetch assigned events for staff:", error);
  }

  return <StaffScanClient initialEvents={assignedEvents} userId={userId} />;
}
