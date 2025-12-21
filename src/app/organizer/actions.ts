'use server';

import { createEvent, CreateEventPayload, type CreateTicketTypePayload, type UpdateTicketTypePayload } from "@/lib/backend-client";
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

export async function createTicketTypeAction(eventId: string, formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const quantity = formData.get("quantity") as string;
    const active = formData.get("active") === "true";

    if (!name || !price || !quantity) {
        throw new Error("Missing required fields: name, price, and quantity are required");
    }

    try {
        const { createTicketType } = await import("@/lib/backend-client");
        const payload: CreateTicketTypePayload = {
            name,
            description: description || undefined,
            price: parseFloat(price),
            totalQuantity: parseInt(quantity, 10),
            active,
        };
        await createTicketType(eventId, payload);
        revalidatePath(`/events/${eventId}`);
    } catch (error) {
        console.error("Failed to create ticket type", error);
        throw error;
    }
}

export async function updateTicketTypeAction(
    eventId: string,
    ticketTypeId: string,
    formData: FormData,
) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const quantity = formData.get("quantity") as string;
    const active = formData.get("active") as string;

    try {
        const { updateTicketType } = await import("@/lib/backend-client");
        const payload: UpdateTicketTypePayload = {};

        if (name && name !== "") payload.name = name;
        if (description !== null && description !== "") payload.description = description;
        else if (description === "") payload.description = undefined; // unset if empty string? or maybe just ignore. Typically empty string means 'remove'.
        // Refined per request: "treat empty string as unset (use undefined)" implies removing it?
        // Actually the request said: "check value !== null && value !== '' ... e.g. for description ... treat empty string as unset (use undefined)"
        // This likely means if the user sends "", we might want to clear it or ignore it. 
        // Let's stick to: only set if present and non-empty. 
        // Wait, if I want to CLEAr a description, I might send empty string.
        // But the prompt says "only set payload fields when the value is present and non-empty".
        // So I will IGNORE empty strings.

        if (description && description !== "") payload.description = description;
        if (price && price !== "") payload.price = parseFloat(price);
        if (quantity && quantity !== "") payload.quantity = parseInt(quantity, 10);
        if (active && active !== "") payload.active = active === "true";

        await updateTicketType(eventId, ticketTypeId, payload);
        revalidatePath(`/events/${eventId}`);
    } catch (error) {
        console.error("Failed to update ticket type", error);
        throw error;
    }
}

export async function deleteTicketTypeAction(eventId: string, ticketTypeId: string) {
    try {
        const { deleteTicketType } = await import("@/lib/backend-client");
        await deleteTicketType(eventId, ticketTypeId);
        revalidatePath(`/events/${eventId}`);
    } catch (error) {
        console.error("Failed to delete ticket type", error);
        throw error;
    }
}