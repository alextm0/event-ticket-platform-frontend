import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/backend-client";
import { successResponse, handleRouteError } from "@/lib/api-response";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    let userId = "unknown";
    try {
        const { userId: id } = await params;
        userId = id;
        const user = await getUserById(userId);
        return successResponse(user);
    } catch (error: any) {
        return handleRouteError(error, `Failed to fetch user ${userId}`);
    }
}
