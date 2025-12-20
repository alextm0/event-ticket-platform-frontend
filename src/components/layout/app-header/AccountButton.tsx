'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { SESSION_UPDATED_EVENT } from "@/lib/session-events";

function readAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("authToken");
}

function AccountButton() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const update = () => setIsLoggedIn(!!readAuthToken());
    update();
    window.addEventListener("storage", update);
    window.addEventListener(SESSION_UPDATED_EVENT, update as EventListener);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener(SESSION_UPDATED_EVENT, update as EventListener);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed", error);
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      setIsLoggedIn(false);
      window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
      window.location.href = "/sign-in";
    }
  };

  return (
    <div className="flex items-center gap-3">
      {isLoggedIn ? (
        <Button
          variant="mint"
          size="default"
          onClick={handleSignOut}
          className="font-semibold gap-2"
        >
          Sign out
        </Button>
      ) : (
        <Button asChild variant="mint" size="default" className="font-semibold">
          <Link href="/sign-in">
            Sign in
          </Link>
        </Button>
      )}
    </div>
  );
}

export default AccountButton;
