'use client';

import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@stackframe/stack";
import HomepageButton from "./HomepageButton";
import Head from "next/head";
import HeaderLink from "./HeaderLink";
import AccountButton from "./AccountButton";
import ROLE_PAGES from "@/utils/role-pages";
import ROLE_DESTINATIONS from "@/utils/role-destinations";
import ROLE_LABELS from "@/utils/role-labels";

export function AppHeader() {
  const pathname = usePathname();
  const user = useUser({ or: "return-null" });
  const role = (user?.clientReadOnlyMetadata as { role?: string } | undefined)?.role ?? null;
  const destination = role ? ROLE_DESTINATIONS[role] : user ? "/" : null;
  const linkLabel = role ? ROLE_LABELS[role] : "Dashboard";

  const links = role ? ROLE_PAGES[role] : [];

  return (
    <header className="border-b border-slate-800 bg-slate-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <HomepageButton/>
        <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
          {links.map((item) =>  <HeaderLink key={item.href} item={item} />)}
        </nav>
        <AccountButton />
      </div>
    </header>
  );
}