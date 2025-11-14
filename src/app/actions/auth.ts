// src/app/actions/auth.ts
'use server'; // 👈 This is the magic line. It tells Next.js this runs on the server.

import {StackServerApp} from "@stackframe/stack"; // Import your stack server instance
import { backendClient } from "@/lib/backend-client";
import {stackServerApp} from "@/stack/server";

export async function syncUserWithBackend() {
    // 1. Get the user securely on the server side
    const user = await stackServerApp.getUser();

    if (!user) {
        console.log("❌ No user found in session during sync");
        return;
    }

    try {
        // 2. Call your existing backend client
        // Since this file is running on the server, importing "server-env" inside backendClient is SAFE here.
        await backendClient.createBackendUser(user, {
            id: user.id,
            email: user.primaryEmail || "no-email",
            fullName: user.displayName || "New User",
            role: "USER",
            password: "managed-by-stack-auth-secure-placeholder",
        });

        console.log(`✅ User ${user.id} synced successfully`);
        return { success: true };

    } catch (error: any) {
        // Handle the "Already Exists" (409) case gracefully
        if (error.message && error.message.includes("409")) {
            return { success: true };
        }

        console.error("❌ Sync failed:", error);
        return { success: false, error: error.message };
    }
}