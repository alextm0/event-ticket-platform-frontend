import Link from "next/link";
import { requireRole } from "@/lib/auth-guards";
import { PageHeader } from "@/components/ui/page-header";
import { AttendeePromo } from "@/components/attendee/AttendeePromo";

export default async function AttendeePage() {
  await requireRole("attendee", { allowGrant: false });

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12 lg:px-8">
      <PageHeader
        title="Attendee workspace"
        description="Access is granted because you have the attendee role."
      />

      <AttendeePromo />

      <Link href="/" className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300">
        <span aria-hidden="true">&lt;-</span> Back to home
      </Link>
    </div>
  );
}
