// src/components/AuthSync.tsx
'use client';

import { useUser } from "@stackframe/stack";
import { useEffect, useRef } from "react";
// 👇 REMOVE the import to backend-client
// import { backendClient } from "@/lib/backend-client";

// 👇 ADD the import to your new Server Action
import { syncUserWithBackend } from "@/app/actions/auth";

export default function AuthSync() {
    const user = useUser();
    const isSyncing = useRef(false);

    useEffect(() => {
        const sync = async () => {
            // We still check if 'user' exists on the client to know WHEN to trigger
            if (!user || isSyncing.current) return;

            isSyncing.current = true;

            try {
                // 👇 Call the Server Action
                await syncUserWithBackend();
            } catch (err) {
                console.error("Sync error", err);
            } finally {
                isSyncing.current = false;
            }
        };

        sync();
    }, [user]);

    return null;
}