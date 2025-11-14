import { Suspense } from "react";

import { StackProvider, StackTheme } from "@stackframe/stack";

import { AppHeader } from "@/components/AppHeader";
import { stackClientApp } from "@/stack/client";

import "./globals.css";
import AuthSync from "@/components/AuthSync";

const authTheme = {
  dark: {
    background: "#020617",
    card: "#0f172a",
    border: "#1e293b",
    primary: "#38bdf8",
    primaryForeground: "#020617",
    secondary: "#38bdf8",
    secondaryForeground: "#020617",
    accent: "#38bdf8",
    accentForeground: "#020617",
    destructive: "#ef4444",
    destructiveForeground: "#f8fafc",
    muted: "#1e293b",
    mutedForeground: "#94a3b8",
    popover: "#0f172a",
    popoverForeground: "#f8fafc",
    ring: "#38bdf8",
    foreground: "#f8fafc",
    cardForeground: "#f8fafc",
    input: "#1e293b",
  },
  font: {
    family: "inherit",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 antialiased">
        <StackProvider app={stackClientApp}>
          <StackTheme theme={authTheme}>
            <Suspense fallback={<div className="border-b border-slate-800 bg-slate-900 py-3" />}>
              <AppHeader />
            </Suspense>
            <main className="mx-auto min-h-screen max-w-5xl px-4 py-6">{children}</main>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
