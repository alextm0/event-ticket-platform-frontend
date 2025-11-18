import { Suspense } from "react";

import { AppHeader } from "@/components/app-header/AppHeader";

import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 antialiased">
        <Suspense fallback={<div className="border-b border-slate-800 bg-slate-900 py-3" />}>
          <AppHeader />
        </Suspense>
        <main className="mx-auto min-h-screen max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
