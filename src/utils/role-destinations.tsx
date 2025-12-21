import { AppRole } from "@/lib/user-profile";

const ROLE_DESTINATIONS: Record<AppRole, string> = {
  admin: "/admin",
  organizer: "/organizer",
  staff: "/staff",
  attendee: "/my-tickets",
};
export default ROLE_DESTINATIONS;