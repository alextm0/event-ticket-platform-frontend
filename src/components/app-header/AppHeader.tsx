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
    <header className="border-b border-slate-800 bg-slate-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <HomepageButton />
        <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
          {links.map((item) => (
            <HeaderLink key={item.href} item={item} />
          ))}
        </nav>
        <AccountButton />
      </div>
    </header>
  );
}
