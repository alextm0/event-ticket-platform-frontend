'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { SESSION_UPDATED_EVENT } from "@/lib/session-events";
import { LogOut, User, ChevronDown } from "lucide-react";

function readAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("authToken");
}

function readUserEmail() {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("userEmail");
}

function readUserRole() {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("userRole");
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  organizer: "Organizer",
  staff: "Staff",
  attendee: "Attendee",
};

function AccountButton() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      setIsLoggedIn(!!readAuthToken());
      setUserEmail(readUserEmail());
      setUserRole(readUserRole());
    };
    update();
    window.addEventListener("storage", update);
    window.addEventListener(SESSION_UPDATED_EVENT, update as EventListener);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener(SESSION_UPDATED_EVENT, update as EventListener);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
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

  // Get user initial from email
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";
  const roleLabel = userRole ? ROLE_LABELS[userRole] || userRole : null;

  return (
    <div className="flex items-center gap-3">
      {isLoggedIn ? (
        <div className="relative" ref={dropdownRef}>
          {/* Avatar Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 rounded-full p-1 pr-3 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-all duration-200 group"
          >
            {/* Avatar Circle */}
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
                {userInitial}
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[var(--color-surface)]" />
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl shadow-black/20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{userEmail}</p>
                    {roleLabel && (
                      <p className="text-xs text-emerald-400 font-medium">{roleLabel}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-red-500/10 transition-colors group"
                >
                  <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
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
