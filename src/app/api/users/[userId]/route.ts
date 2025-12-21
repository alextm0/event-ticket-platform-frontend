import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/backend-client";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    let userId = "unknown";
    try {
        const { userId: id } = await params;
        userId = id;
        const user = await getUserById(userId);
        return NextResponse.json(user);
    } catch (error: any) {
        console.error(`Failed to fetch user ${userId}`, error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch user details" },
            { status: 500 }
        );
    }
}
