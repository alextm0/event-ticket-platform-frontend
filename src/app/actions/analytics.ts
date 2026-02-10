"use server";

import { getEventSalesHistory, getEventOrders, getEventOperationsMetrics } from "@/lib/backend-client";

export async function fetchEventAnalytics(eventId: string) {
    const [salesResult, ordersResult, operationsResult] = await Promise.allSettled([
        getEventSalesHistory(eventId),
        getEventOrders(eventId),
        getEventOperationsMetrics(eventId)
    ]);

    const salesHistory = salesResult.status === "fulfilled" ? salesResult.value : [];
    const orders = ordersResult.status === "fulfilled" ? ordersResult.value : [];
    const operations = operationsResult.status === "fulfilled"
        ? operationsResult.value
        : { checkedInCount: 0, totalSold: 0, noShowRate: 0 };

    if (salesResult.status === "rejected") console.error("Analytics sales-history failed:", salesResult.reason);
    if (ordersResult.status === "rejected") console.error("Analytics orders failed:", ordersResult.reason);
    if (operationsResult.status === "rejected") console.error("Analytics operations failed:", operationsResult.reason);

    return { salesHistory, orders, operations };
}
