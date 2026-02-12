import { StaffManagement } from "@/components/organizer/StaffManagement";
import type { StaffMember } from "@/types";

interface StaffTabProps {
  eventId: string;
  assignedStaff: StaffMember[];
  availableStaff: StaffMember[];
}

export function StaffTab({ eventId, assignedStaff, availableStaff }: StaffTabProps) {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-white/10 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <StaffManagement
        eventId={eventId}
        assignedStaff={assignedStaff}
        availableStaff={availableStaff}
      />
    </div>
  );
}

