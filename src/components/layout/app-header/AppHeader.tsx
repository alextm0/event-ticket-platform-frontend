'use client';

import { useEffect, useState } from "react";
import HomepageButton from "./HomepageButton";
import HeaderLink from "./HeaderLink";
import AccountButton from "./AccountButton";
import ROLE_PAGES from "@/utils/role-pages";
import { SESSION_UPDATED_EVENT } from "@/lib/session-events";

function readRoleFromStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("userRole");
}

export function AppHeader() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setRole(readRoleFromStorage());
    };
    update();
    window.addEventListener("storage", update);
    window.addEventListener(SESSION_UPDATED_EVENT, update as EventListener);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener(SESSION_UPDATED_EVENT, update as EventListener);
    };
  }, []);

  const links = role ? ROLE_PAGES[role] || [] : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur-xl transition-all duration-200">
      <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2">
          <HomepageButton />
        </div>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 transform items-center gap-8 md:flex">
          <HeaderLink
            item={{ href: "/browse-events", label: "Browse Events" }}
          />
          {links.map((item) => (
            <HeaderLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-6 md:hidden">
            {/* Mobile or tablet view fallback if needed, for now just keeping structure */}
          </nav>
          <AccountButton />
        </div>
      </div>
    </header>
  );
}
