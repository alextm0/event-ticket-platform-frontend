'use client';

import Link from "next/link";
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

  const handleSignOut = () => {
    // TODO: Replace with actual sign out logic
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
        <div className="flex items-center gap-3">
          <button
            onClick={handleSignOut}
            className="rounded bg-slate-700 px-3 py-1 text-sm font-medium text-slate-200 hover:bg-slate-600"
          >
            Sign out
          </button>
        </div>
      ) : (
        <Link
          href="/sign-in"
          className="rounded bg-sky-500 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-sky-400"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}

export default AccountButton;
