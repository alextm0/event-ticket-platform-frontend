import Link from "next/link";
import { requireRole } from "@/lib/auth-guards";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { QrCode, ClipboardList, Shield, ArrowRight } from "lucide-react";

export default async function StaffPage() {
  await requireRole("staff", { allowGrant: false });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8 space-y-12">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-4 inline-flex items-center rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400 border border-sky-500/20">
          <Shield className="mr-1.5 h-3 w-3" />
          Staff Workspace
        </div>
        <PageHeader
          title="Operational Overview"
          description="Manage on-site event entry, ticket validation, and check-in logs."
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-8 transition-all hover:border-sky-500/30 hover:bg-white/[0.08] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30">
            <QrCode className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Ticket Scanning</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Access the high-speed QR scanner to validate attendee tickets in real-time. Supports multi-event selection.
          </p>
          <Button className="w-full bg-sky-600 hover:bg-sky-500 text-white gap-2 group/btn" asChild>
            <Link href="/staff/scan">
              Open Scanner
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-8 transition-all hover:border-emerald-500/30 hover:bg-white/[0.08] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Validation Logs</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Review recent scan attempts, identify blocked tickets, and monitor entry throughput.
          </p>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2 group/btn" asChild>
            <Link href="/staff/validation-logs">
              View History
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back to Home
        </Link>
        <p className="text-xs text-slate-600">
          Authorized operations only. All scans are logged for security.
        </p>
      </div>
    </div>
  );
}
