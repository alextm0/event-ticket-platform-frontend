import { useRef, useCallback } from 'react';

// Global cache to persist across Strict Mode unmounts
const globalScanCache = {
    lastCode: null as string | null,
    lastTime: 0
};

const COOLDOWN_MS = 3000; // 3 seconds cooldown for the SAME code

export function useScanCooldown() {
    const isProcessingRef = useRef(false);

    const canScan = useCallback((code: string): boolean => {
        // 1. Check local processing lock
        if (isProcessingRef.current) return false;

        // 2. Check global cooldown for duplicate codes
        const now = Date.now();
        if (
            globalScanCache.lastCode === code &&
            (now - globalScanCache.lastTime) < COOLDOWN_MS
        ) {
            return false;
        }

        return true;
    }, []);

    const lock = useCallback((code: string) => {
        isProcessingRef.current = true;
        globalScanCache.lastCode = code;
        globalScanCache.lastTime = Date.now();
    }, []);

    const unlock = useCallback(() => {
        isProcessingRef.current = false;
    }, []);

    return { canScan, lock, unlock };
}
