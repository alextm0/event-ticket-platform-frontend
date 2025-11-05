import { Suspense } from "react";

import { StackProvider, StackTheme } from "@stackframe/stack";

import { AppHeader } from "@/components/AppHeader";
import { stackClientApp } from "@/stack/client";

import "./globals.css";

const authTheme = {
  color: {
    background: "#020617",
    cardBackground: "#0f172a",
    cardBorder: "#1e293b",
    textPrimary: "#f8fafc",
    textSecondary: "#cbd5f5",
    buttonBackground: "#38bdf8",
    buttonText: "#020617",
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
