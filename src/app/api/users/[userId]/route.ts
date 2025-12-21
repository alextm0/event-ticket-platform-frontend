import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/backend-client";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const user = await getUserById(userId);
        return NextResponse.json(user);
    } catch (error: any) {
        console.error(`Failed to fetch user ${params}`, error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch user details" },
            { status: 500 }
        );
    }
}
