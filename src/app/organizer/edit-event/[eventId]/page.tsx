import { redirect } from "next/navigation";
import { getEvent } from "@/lib/backend-client";
import { requireRole } from "@/lib/auth-guards";
import EventForm from "@/components/organizer/EventForm";
import { PageHeader } from "@/components/ui/page-header";
import { notFound } from "next/navigation";

interface EditEventPageProps {
    params: Promise<{
        eventId: string;
    }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
    await requireRole("organizer");
    const { eventId } = await params;

    let event;
    try {
        event = await getEvent(eventId);
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("403") || msg.includes("401")) {
            redirect(`/sign-in?session_expired=1&next=/organizer/edit-event/${eventId}`);
        }
        console.error("Failed to fetch event for editing", error);
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <PageHeader
                    title="Edit Event"
                    description="Update your event information"
                    className="text-center mb-8"
                />
                <EventForm initialData={event} />
            </div>
        </div>
    );
}
