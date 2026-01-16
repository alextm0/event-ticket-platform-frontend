'use client';

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isClientAuthenticated, getClientUserRole } from "@/lib/client-auth";

const ROLE_DESTINATIONS: Record<string, string> = {
  admin: "/admin",
  organizer: "/organizer",
  staff: "/staff",
  attendee: "/my-tickets",
};

export function GetStartedButton() {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (isClientAuthenticated()) {
      // User is authenticated - redirect to their role dashboard
      const role = getClientUserRole();
      const destination = role ? ROLE_DESTINATIONS[role] : null;
      
      if (destination) {
        router.push(destination);
      } else {
        // Fallback: redirect to home if role is unknown
        router.push("/");
      }
    } else {
      // User is not authenticated - redirect to sign in page
      router.push("/sign-in");
    }
  };

  return (
    <Button size="lg" variant="mint" onClick={handleClick}>
      Get Started <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}
