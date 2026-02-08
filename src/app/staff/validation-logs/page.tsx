import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUserId, getStaffAssignedEvents } from "@/lib/backend-client";
import { ValidationLogsClient } from "./ValidationLogsClient";
import { Shield } from "lucide-react";

export default async function ValidationLogsPage() {
  await requireRole("staff", { allowGrant: false });

  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/sign-in");
  }

  let assignedEvents: Array<{ eventId: string; eventName: string }> = [];
  try {
    const events = await getStaffAssignedEvents(userId);
    assignedEvents = events || [];
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("403") || msg.includes("401")) {
      redirect("/sign-in?session_expired=1&next=/staff/validation-logs");
    }
    console.error("Failed to fetch assigned events for staff:", error);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8 space-y-8">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-4 inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
          <Shield className="mr-1.5 h-3 w-3" />
          Staff Workspace
        </div>
        <PageHeader
          title="Validation Logs"
          description="Review recent scan attempts, identify blocked tickets, and monitor entry throughput across your assigned events."
        />
      </div>

      <ValidationLogsClient initialEvents={assignedEvents} />
    </div>
  );
}

