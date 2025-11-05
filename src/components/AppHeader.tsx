'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserButton, useUser } from "@stackframe/stack";

const ROLE_DESTINATIONS: Record<string, string> = {
  admin: "/admin",
  organizer: "/organizer",
  staff: "/staff",
  attendee: "/attendee",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin Dashboard",
  organizer: "Organizer Workspace",
  staff: "Staff Workspace",
  attendee: "Attendee Workspace",
};

export function AppHeader() {
  const pathname = usePathname();
  const user = useUser({ or: "return-null" });

  const role =
    (user?.clientReadOnlyMetadata as { role?: string } | undefined)?.role ??
    (user?.serverMetadata as { role?: string } | undefined)?.role ??
    null;
  const destination = role ? ROLE_DESTINATIONS[role] : user ? "/" : null;
  const linkLabel = role ? ROLE_LABELS[role] : "Dashboard";

  const links = destination ? [{ href: destination, label: linkLabel }] : [];

  return (
    <header className="border-b border-slate-800 bg-slate-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight text-slate-100">
          Event Ticketing Platform
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded px-3 py-1 transition ${
                pathname === item.href
                  ? "bg-sky-500 text-slate-900"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <UserButton />
          ) : (
            <Link
              href="/sign-in"
              className="rounded bg-sky-500 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-sky-400"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
