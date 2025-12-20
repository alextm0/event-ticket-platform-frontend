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
    Minimize2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignedEvent {
    eventId: string;
    eventName: string;
}

interface StaffScanClientProps {
    initialEvents: AssignedEvent[];
}

export function StaffScanClient({ initialEvents }: StaffScanClientProps) {
    const [eventId, setEventId] = useState<string>(initialEvents[0]?.eventId || "");
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [isScanning, setIsScanning] = useState<boolean>(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
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

    const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
        if (detectedCodes.length > 0) {
            const result = detectedCodes[0].rawValue;
            if (result && result !== scannedData) {
                if (!eventId) return;

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
                } catch (error) {
                    console.error("Error validating ticket:", error);
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
