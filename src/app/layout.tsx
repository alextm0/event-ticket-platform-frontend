import { Suspense } from "react";
import { Inter } from "next/font/google"; // Using Inter as primary font
import { AppHeader } from "@/components/layout/app-header/AppHeader";

import "../styles/globals.css"; // Moved globals.css

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} dark`}>
      <body className="antialiased min-h-screen">
        <Suspense fallback={<div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] py-3" />}>
          <AppHeader />
        </Suspense>
        <main className="mx-auto min-h-screen max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
