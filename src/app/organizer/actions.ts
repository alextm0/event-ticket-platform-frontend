'use server';

import { createEvent, CreateEventPayload } from "@/lib/backend-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createEventAction(formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;

    if (!title || !description || !location || !startTime || !endTime) {
        throw new Error("Missing required fields");
    }

    const payload: CreateEventPayload = {
        title,
        description,
        location,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
    };

    try {
        await createEvent(payload);
    } catch (error) {
        console.error("Failed to create event", error);
        // Return error state if we were using useFormState, but simple throw for now or handle in component if using client fetch
        throw error;
    }

    revalidatePath("/organizer");
    redirect("/organizer");
}

export async function deleteEventAction(eventId: string) {
    try {
        const { deleteEvent } = await import("@/lib/backend-client");
        await deleteEvent(eventId);
        revalidatePath("/organizer");
    } catch (error) {
        console.error("Failed to delete event", error);
        throw error;
    }
}

export async function updateEventAction(eventId: string, formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const status = formData.get("status") as string;

    const { updateEvent, updateEventStatus } = await import("@/lib/backend-client");

    const payload: any = {};
    if (title) payload.title = title;
    if (description) payload.description = description;
    if (location) payload.location = location;
    if (startTime) payload.startTime = new Date(startTime).toISOString();
    if (endTime) payload.endTime = new Date(endTime).toISOString();

    try {
        // If other fields are present, update them via PUT
        if (Object.keys(payload).length > 0) {
            await updateEvent(eventId, payload);
        }

        // If status is provided, update it via specialized PATCH
        if (status) {
            await updateEventStatus(eventId, status);
        }
    } catch (error) {
        console.error("Failed to update event", error);
        throw error;
    }

    revalidatePath("/organizer");
    revalidatePath(`/events/${eventId}`);
    redirect("/organizer");
}

export async function assignStaffAction(eventId: string, staffId: string) {
    try {
        const { assignStaffToEvent } = await import("@/lib/backend-client");
        await assignStaffToEvent(eventId, staffId);
        revalidatePath(`/events/${eventId}`);
    } catch (error) {
        console.error("Failed to assign staff", error);
        throw error;
    }
}

export async function removeStaffAction(eventId: string, staffId: string) {
    try {
        const { removeStaffFromEvent } = await import("@/lib/backend-client");
        await removeStaffFromEvent(eventId, staffId);
        revalidatePath(`/events/${eventId}`);
    } catch (error) {
        console.error("Failed to remove staff", error);
        throw error;
    }
}
