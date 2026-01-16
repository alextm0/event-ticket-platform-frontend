import Link from "next/link";
import { BarChart3, Users, Ticket, Globe, Zap, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { GetStartedButton } from "@/components/GetStartedButton";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-24 pb-20">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center pt-20 text-center">
        {/* Glow Effects */}
        <div className="absolute -top-20 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-[var(--color-primary)] opacity-10 blur-[100px]" />

        <div className="relative z-10 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--color-primary)]">
            <span className="mr-2 flex h-2 w-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            v2.0 Now Available
          </div>

          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
            <span className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              The Future of
            </span>
            <br />
            <span className="text-white">Event Ticketing</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-slate-300 md:text-xl">
            Manage events, track sales in real-time, and analyze audience behavior with a platform designed for scale and precision.
          </p>

          <div className="flex items-center justify-center">
            <GetStartedButton />
          </div>
        </div>

        {/* Floating Dashboard Preview */}
        <div className="relative mt-20 w-full max-w-5xl animate-in fade-in zoom-in-95 duration-1000 delay-300">
          <GlassCard className="relative overflow-hidden border-[var(--color-border)] p-0 shadow-2xl">
            {/* Dashboard Header Mockup */}
            <div className="flex items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/50 px-6 py-4">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/20" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
                <div className="h-3 w-3 rounded-full bg-green-500/20" />
              </div>
              <div className="mx-auto h-6 w-64 rounded-lg bg-[var(--color-border)]/50" />
            </div>

            {/* Content Mockup */}
            <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-3">
              {/* Stat Cards */}
              <GlassCard gradient className="col-span-2 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-[var(--color-secondary)]">Total Revenue</p>
                  <h3 className="mt-2 text-4xl font-bold text-white">$456,502</h3>
                </div>
                <div className="mt-8 h-32 w-full rounded-lg bg-gradient-to-t from-[var(--color-primary)]/20 to-transparent" />
              </GlassCard>

              <div className="space-y-6">
                <GlassCard className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--color-secondary)]">Active Events</p>
                    <h3 className="text-2xl font-bold text-white">12</h3>
                  </div>
                  <Ticket className="h-8 w-8 text-[var(--color-primary)]" />
                </GlassCard>
                <GlassCard className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--color-secondary)]">Tickets Sold</p>
                    <h3 className="text-2xl font-bold text-white">8,540</h3>
                  </div>
                  <Users className="h-8 w-8 text-[var(--color-primary)]" />
                </GlassCard>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Powerful Analytics</h2>
          <p className="mt-4 text-slate-300">Everything you need to grow your event business.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <GlassCard className="col-span-1 md:col-span-2" gradient>
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="mb-4 inline-flex rounded-lg bg-[var(--color-primary)]/10 p-2 text-[var(--color-primary)]">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white">Real-time Sales Tracking</h3>
                <p className="mt-2 text-slate-300">Monitor ticket sales as they happen with standard deviation alerts.</p>
              </div>
              <div className="mt-8 flex gap-2">
                {[40, 70, 50, 90, 60, 80, 50].map((h, i) => (
                  <div key={i} style={{ height: `${h}%` }} className="w-full flex-1 rounded-t-sm bg-[var(--color-primary)]/20 hover:bg-[var(--color-primary)] transition-colors" />
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-4 inline-flex rounded-lg bg-blue-500/10 p-2 text-blue-500">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white">Global Reach</h3>
            <p className="mt-2 text-slate-300">Accept payments from 135+ currencies and local payment methods.</p>
          </GlassCard>

          <GlassCard>
            <div className="mb-4 inline-flex rounded-lg bg-purple-500/10 p-2 text-purple-500">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white">Instant Payouts</h3>
            <p className="mt-2 text-slate-300">Get paid immediately after each sale with our automated clearing.</p>
          </GlassCard>

          <GlassCard className="col-span-1 md:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-4 inline-flex rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white">Fraud Protection</h3>
                <p className="mt-2 text-slate-300">AI-powered fraud detection system blocks suspicious transactions.</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Interactive List Preview */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
          </div>
        </div>

        <GlassCard className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/50 text-[var(--color-secondary)]">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Event</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {[
                  { id: "#0012451", event: "Musical Drama", customer: "Elisabeth Queen", status: "Completed", amount: "$536.00" },
                  { id: "#0012452", event: "Live Choir", customer: "Bella Simatupang", status: "Pending", amount: "$125.70" },
                  { id: "#0012453", event: "Jazz Night", customer: "David Bekam", status: "Completed", amount: "$65.22" },
                ].map((order, i) => (
                  <tr key={i} className="group hover:bg-[var(--color-primary)]/5 transition-colors">
                    <td className="px-6 py-4 text-[var(--color-secondary)]">{order.id}</td>
                    <td className="px-6 py-4 font-medium text-white">{order.event}</td>
                    <td className="px-6 py-4 text-[var(--color-secondary)]">{order.customer}</td>
                    <td className="px-6 py-4">
                      <span className={order.status === 'Completed' ? "text-emerald-500" : "text-yellow-500"}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-white group-hover:text-[var(--color-primary)] transition-colors">
                      {order.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </section>

      {/* CTA Section */}
      <section className="mx-auto mb-20 max-w-3xl text-center">
        <GlassCard gradient className="py-16">
          <h2 className="text-3xl font-bold text-white">Ready to transform your events?</h2>
          <p className="mt-4 text-slate-300">Join thousands of event organizers who trust us.</p>
          <div className="mt-8">
            <Button size="lg" variant="mint" className="min-w-[200px]">
              Generate First Report
            </Button>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
