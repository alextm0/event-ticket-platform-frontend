"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { AssignedEvent } from "@/types";
import { ScannerView } from "./components/ScannerView";
import { ScanHistory } from "./components/ScanHistory";
import { EventSelector } from "./components/EventSelector";
import { useScanCooldown } from "./hooks/useScanCooldown";
import { useTicketValidator } from "./hooks/useTicketValidator";

interface StaffScanClientProps {
    initialEvents: AssignedEvent[];
}

export function StaffScanClient({ initialEvents }: StaffScanClientProps) {
    const [eventId, setEventId] = useState<string>(initialEvents[0]?.eventId || "");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isScanning, setIsScanning] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    // Hooks
    const cooldown = useScanCooldown();
    const validator = useTicketValidator({
        eventId,
        onValidationComplete: () => {
            // After validation completes, wait a bit then re-enable scanning UI
            setTimeout(() => {
                setIsScanning(true);
                validator.reset();
                cooldown.unlock();
            }, 3000); // Show result for 3 seconds
        }
    });

    // Fullscreen behavior
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    // Initialize logs
    useEffect(() => {
        validator.fetchLogs();
    }, [validator.fetchLogs]);

    // Handle Scan Event
    const handleScan = useCallback(async (detectedCodes: IDetectedBarcode[]) => {
        if (detectedCodes.length === 0 || !eventId) return;

        const scannedCode = detectedCodes[0].rawValue;

        // 1. Check Cooldown/Lock
        if (!cooldown.canScan(scannedCode)) {
            return;
        }

        // 2. Lock execution
        cooldown.lock(scannedCode);
        setIsScanning(false);

        // 3. Initiate Validation
        await validator.validate(scannedCode);

    }, [eventId, cooldown, validator]);

    const handleError = (error: unknown) => {
        console.error("Scanner Error:", error);
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "min-h-screen bg-[#0f1115] transition-all flex flex-col items-center",
                isFullscreen ? "fixed inset-0 z-50 justify-center p-0" : "px-6 py-8"
            )}
        >
            <div className={cn(
                "w-full flex flex-col gap-6",
                isFullscreen ? "max-w-md h-full justify-between py-8" : "max-w-2xl"
            )}>
                {/* Header */}
                {!isFullscreen && (
                    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-700">
                        <Link
                            href="/staff"
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors group mb-2"
                        >
                            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back to Staff Workspace
                        </Link>
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-white">Ticket Validator</h1>
                            <Button
                                onClick={toggleFullscreen}
                                variant="ghost"
                                size="sm"
                                className="text-slate-400 hover:text-white gap-2"
                            >
                                <Maximize2 className="h-4 w-4" />
                                Enter Entry Mode
                            </Button>
                        </div>
                    </div>
                )}

                {/* Event Selector */}
                <EventSelector
                    events={initialEvents}
                    selectedEventId={eventId}
                    onSelectEvent={setEventId}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                />

                {/* Main Scanner View */}
                <ScannerView
                    status={validator.status}
                    message={validator.message}
                    details={validator.details}
                    isScanning={isScanning}
                    onScan={handleScan}
                    onError={handleError}
                    isFullscreen={isFullscreen}
                />

                {/* History Log */}
                {!isFullscreen && (
                    <ScanHistory
                        logs={validator.recentLogs}
                        isLoading={false}
                    />
                )}

                {/* Footer */}
                {!isFullscreen && (
                    <div className="text-center">
                        <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em]">Operational Unit</p>
                    </div>
                )}
            </div>
        </div>
    );
}
