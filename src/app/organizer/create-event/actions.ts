"use server";

import { revalidatePath } from "next/cache";
import { backendClient } from "@/lib/backend-client";
import { EventPayload } from "@/types";
import { stackServerApp } from "@/stack/server";

export async function createEventAction(payload: EventPayload) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("You must be logged in to create an event.");
  }
  await backendClient.createEvent(user, payload);
  revalidatePath("/organizer");
}

export async function updateEventAction(
  eventId: string,
  payload: Omit<EventPayload, "organizerId">
) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("You must be logged in to update an event.");
  }
  await backendClient.updateEvent(user, eventId, payload as EventPayload);
  revalidatePath("/organizer");
}