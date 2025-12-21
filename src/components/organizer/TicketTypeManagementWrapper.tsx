"use client";

import { useRouter } from "next/navigation";
import { TicketTypeManagement } from "./TicketTypeManagement";
import { EventTicketType } from "@/types";

interface TicketTypeManagementWrapperProps {
    eventId: string;
    ticketTypes: EventTicketType[];
}

export function TicketTypeManagementWrapper({
    eventId,
    ticketTypes,
}: TicketTypeManagementWrapperProps) {
    const router = useRouter();

    const handleUpdate = () => {
        router.refresh();
    };

    return (
        <TicketTypeManagement
            eventId={eventId}
            ticketTypes={ticketTypes}
            onUpdate={handleUpdate}
        />
    );
}

