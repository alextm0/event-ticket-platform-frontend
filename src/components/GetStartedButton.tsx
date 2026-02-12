'use client';

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isClientAuthenticated, getClientUserRole } from "@/lib/client-auth";
import { ROLE_DESTINATIONS } from "@/constants/roles";
import type { AppRole } from "@/lib/user-profile";

export function GetStartedButton() {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (isClientAuthenticated()) {
      // User is authenticated - redirect to their role dashboard
      const role = getClientUserRole() as AppRole | null | undefined;
      const destination = role ? ROLE_DESTINATIONS[role] : null;
      if (destination) {
        router.push(destination);
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
