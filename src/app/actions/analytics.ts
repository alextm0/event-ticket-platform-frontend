"use server";

import { getEventSalesHistory, getEventOrders, getEventOperationsMetrics } from "@/lib/backend-client";

export async function fetchEventAnalytics(eventId: string) {
    try {
        const [salesHistory, orders, operations] = await Promise.all([
            getEventSalesHistory(eventId),
            getEventOrders(eventId),
            getEventOperationsMetrics(eventId)
        ]);
        return { salesHistory, orders, operations };
    } catch (error) {
        console.error("Failed to fetch analytics:", error);
        return null; // Return null to indicate failure/no data
    }
}
