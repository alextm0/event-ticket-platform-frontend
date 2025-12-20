import EventForm from "@/components/organizer/EventForm";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth-guards";

export default async function CreateEventPage() {
  await requireRole("organizer", { allowGrant: false });

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <PageHeader
          title="Create New Event"
          description="Fill in the details below to draft your new event. You can add ticket types later."
          className="md:flex-col md:items-center text-center space-y-4"
        />
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <EventForm />
        </div>
      </div>
    </div>
  );
}
