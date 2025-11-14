"use client";

import { EventForm } from "@/components/EventForm";
import { useUser } from "@stackframe/stack";

export default function CreateEvent() {
  const user = useUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <EventForm
        organizerId={user?.clientReadOnlyMetadata.appUserId as string}
      />
    </main>
  );
}