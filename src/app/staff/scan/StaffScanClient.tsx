"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { validateTicket } from "@/lib/validate-ticket";
import {
    isTicketValid,
    getValidationMessage,
    sanitizeValidationErrorMessage,
} from "@/lib/ticket-validation-helpers";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    ChevronLeft,
    QrCode,
    CheckCircle2,
    XCircle,
    Loader2,
    Calendar,
    Maximize2,
    Minimize2,
    ArrowRight,
    ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface AssignedEvent {
    eventId: string;
    eventName: string;
}

interface StaffScanClientProps {
    initialEvents: AssignedEvent[];
}

interface ValidationLog {
    id: string;
    eventId: string;
    ticketId: string;
    validationStatus: string;
    ticketStatus: string;
    validatedAt: string;
}

export function StaffScanClient({ initialEvents }: StaffScanClientProps) {
    const [eventId, setEventId] = useState<string>(initialEvents[0]?.eventId || "");
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [isScanning, setIsScanning] = useState<boolean>(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [recentLogs, setRecentLogs] = useState<ValidationLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // Fetch recent logs when eventId changes
    useEffect(() => {
        const fetchRecentLogs = async () => {
            if (!eventId) return;

            setIsLoadingLogs(true);
            try {
                const response = await fetch(`/api/events/${eventId}/validation-logs`, {
                    cache: "no-store"
                });

                if (response.ok) {
                    const logs = await response.json();
                    setRecentLogs(logs.slice(0, 5)); // Get only the 5 most recent
                }
            } catch (error) {
                console.error("Failed to fetch recent logs:", error);
            } finally {
                setIsLoadingLogs(false);
            }
        };

        fetchRecentLogs();
    }, [eventId]);

    const lastScannedTimeRef = useRef<number>(0);
    const COOLDOWN_MS = 2000; // Allow re-scanning same code after 2 seconds

    const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
        if (detectedCodes.length > 0) {
            const result = detectedCodes[0].rawValue;
            const now = Date.now();
            // Allow scanning if it's a different code, or if it's been more than COOLDOWN_MS since last scan
            if (result && (result !== scannedData || (now - lastScannedTimeRef.current) > COOLDOWN_MS)) {
                if (!eventId) return;

                lastScannedTimeRef.current = now;
                setIsScanning(false);
                setScannedData(result);
                setValidationMessage("Validating...");
                setIsValid(null);

                try {
                    const data = await validateTicket(eventId, result, { code: result });
                    const valid = isTicketValid(data);
                    const message = getValidationMessage(data);

                    setValidationMessage(message);
                    setIsValid(valid);

                    // Refresh recent logs after validation
                    const response = await fetch(`/api/events/${eventId}/validation-logs`, {
                        cache: "no-store"
                    });
                    if (response.ok) {
                        const logs = await response.json();
                        setRecentLogs(logs.slice(0, 5));
                    }
                } catch (error) {
                    // Handle error silently and show user-friendly message
                    const msg = sanitizeValidationErrorMessage(error);
                    setValidationMessage(msg);
                    setIsValid(false);
                } finally {
                    setTimeout(() => {
                        setIsScanning(true);
                        setScannedData(null);
                        setValidationMessage(null);
                        setIsValid(null);
                    }, 3500);
                }
            }
        }
    };

    const handleError = (error: unknown) => {
        console.error(error);
        setValidationMessage("Camera Error");
        setIsValid(false);
        setTimeout(() => {
            setIsScanning(true);
            setValidationMessage(null);
            setIsValid(null);
        }, 3000);
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

                {/* Simplified Header */}
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

                {/* Floating Entry Controls */}
                <div className={cn(
                    "flex flex-col gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl animate-in fade-in duration-700",
                    isFullscreen && "mx-4 order-last"
                )}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <Select value={eventId} onValueChange={setEventId}>
                                <SelectTrigger className="h-10 border-white/10 bg-black/40 text-white rounded-lg">
                                    <SelectValue placeholder="Select Event" />
                                </SelectTrigger>
                                <SelectContent className="border-white/10 bg-[#1a1d23] text-white">
                                    {initialEvents.map((event) => (
                                        <SelectItem key={event.eventId} value={event.eventId}>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {event.eventName}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {isFullscreen && (
                            <Button
                                onClick={toggleFullscreen}
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 border-white/10 bg-white/5 text-slate-400"
                            >
                                <Minimize2 className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* The Clean Scanner Viewport */}
                <div className={cn(
                    "relative overflow-hidden border-4 border-white/5 bg-black/40 shadow-2xl transition-all duration-700 mx-auto",
                    isFullscreen
                        ? "flex-1 w-full rounded-[3rem]"
                        : "aspect-square w-full max-w-sm rounded-[2rem]"
                )}>
                    {isScanning ? (
                        <div className="relative h-full w-full">
                            {eventId && (
                                <Scanner
                                    onScan={handleScan}
                                    onError={handleError}
                                    components={{
                                        tracker: () => null,
                                    }}
                                    styles={{
                                        container: { width: "100%", height: "100%" },
                                        video: { width: "100%", height: "100%", objectFit: "cover" },
                                    }}
                                />
                            )}

                            {/* The "Lines on actual camera" - Square Focused Reticle */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(70vw,70vh,280px)] aspect-square border border-white/10 rounded-2xl z-20">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--color-primary)] rounded-tl-xl" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--color-primary)] rounded-tr-xl" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--color-primary)] rounded-bl-xl" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--color-primary)] rounded-br-xl" />
                                {/* Thin Scanning Pulse */}
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary)] animate-scan-focus" />
                            </div>
                        </div>
                    ) : (
                        <div className={cn(
                            "absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center transition-all duration-300",
                            isValid === true ? "bg-emerald-500/90" : isValid === false ? "bg-red-500/90" : "bg-black/80"
                        )}>
                            {isValid === true ? (
                                <CheckCircle2 className="h-20 w-20 text-white mb-4 animate-in zoom-in-50 duration-300" />
                            ) : isValid === false ? (
                                <XCircle className="h-20 w-20 text-white mb-4 animate-in zoom-in-50 duration-300" />
                            ) : (
                                <Loader2 className="h-16 w-16 text-white mb-4 animate-spin" />
                            )}
                            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
                                {validationMessage}
                            </h2>
                        </div>
                    )}
                </div>

                {/* Recent Validation Logs */}
                {!isFullscreen && (
                    <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl p-6 animate-in fade-in duration-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-emerald-400" />
                                <h3 className="text-lg font-semibold text-white">Recent Validations</h3>
                            </div>
                            <Link
                                href="/staff/validation-logs"
                                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                            >
                                View All
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>

                        {isLoadingLogs ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                            </div>
                        ) : recentLogs.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-8">
                                No validations yet. Start scanning tickets!
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {recentLogs.map((log) => {
                                    const isValid = log.validationStatus === "VALID";
                                    const isDuplicate = !isValid && log.ticketStatus === "CHECKED_IN";

                                    return (
                                        <div
                                            key={log.id}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                                isValid
                                                    ? "border-emerald-500/20 bg-emerald-500/5"
                                                    : isDuplicate
                                                        ? "border-yellow-500/20 bg-yellow-500/5"
                                                        : "border-red-500/20 bg-red-500/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "flex h-8 w-8 items-center justify-center rounded-lg",
                                                    isValid
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : isDuplicate
                                                            ? "bg-yellow-500/20 text-yellow-400"
                                                            : "bg-red-500/20 text-red-400"
                                                )}>
                                                    {isValid ? (
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">
                                                        {isValid ? "Valid" : isDuplicate ? "Duplicate" : "Invalid"}
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-mono">
                                                        {log.ticketId?.slice(0, 8) || "Unknown"}...
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                {formatDistanceToNow(new Date(log.validatedAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Compact Footer */}
                {!isFullscreen && (
                    <div className="text-center">
                        <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em]">Operational Unit</p>
                    </div>
                )}
            </div>

            <style jsx global>{`
        @keyframes scan-focus {
          0% { top: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-focus {
          animation: scan-focus 2s linear infinite;
        }
      `}</style>
        </div>
    );
}
