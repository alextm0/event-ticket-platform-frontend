import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, XOctagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScanStatus, ScanResultDetails } from "../types";
import { formatDistanceToNow } from "date-fns";

interface ScannerViewProps {
    status: ScanStatus;
    message: string | null;
    details: ScanResultDetails | null;
    isScanning: boolean;
    onScan: (detectedCodes: IDetectedBarcode[]) => void;
    onError: (error: unknown) => void;
    isFullscreen: boolean;
}

export function ScannerView({
    status,
    message,
    details,
    isScanning,
    onScan,
    onError,
    isFullscreen
}: ScannerViewProps) {

    const getStatusColor = () => {
        switch (status) {
            case 'valid': return "text-emerald-400 bg-emerald-500/20";
            case 'duplicate': return "text-yellow-400 bg-yellow-500/20";
            case 'wrong-event': return "text-orange-400 bg-orange-500/20";
            case 'invalid':
            case 'error': return "text-red-400 bg-red-500/20";
            default: return "text-white bg-white/10";
        }
    };

    const getStatusBg = () => {
        switch (status) {
            case 'valid': return "bg-emerald-950/95";
            case 'duplicate': return "bg-yellow-950/95";
            case 'wrong-event': return "bg-orange-950/95";
            case 'invalid':
            case 'error': return "bg-red-950/95";
            default: return "bg-black/90";
        }
    };

    const formatSafeDate = (dateStr: string | undefined, formatter: (d: Date) => string): string => {
        if (!dateStr) return "Unknown";
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? "Unknown" : formatter(date);
    };

    return (
        <div className={cn(
            "relative overflow-hidden border-4 border-white/5 bg-black/40 shadow-2xl transition-all duration-700 mx-auto",
            isFullscreen
                ? "flex-1 w-full rounded-[3rem]"
                : "aspect-square w-full max-w-sm rounded-[2rem]"
        )}>
            {isScanning ? (
                <div className="relative h-full w-full">
                    <Scanner
                        onScan={onScan}
                        onError={onError}
                        scanDelay={200} // Lower delay, we handle cooldown manually
                        components={{ tracker: () => null }}
                        styles={{
                            container: { width: "100%", height: "100%" },
                            video: { width: "100%", height: "100%", objectFit: "cover" },
                        }}
                    />
                    {/* Reticle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(70vw,70vh,280px)] aspect-square border border-white/10 rounded-2xl z-20 pointer-events-none">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--color-primary)] rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--color-primary)] rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--color-primary)] rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--color-primary)] rounded-br-xl" />
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary)] animate-scan-focus" />
                    </div>
                </div>
            ) : (
                <div className={cn(
                    "absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center transition-all duration-300",
                    getStatusBg()
                )}>
                    <div className={cn(
                        "mb-6 rounded-full p-4 animate-in zoom-in-50 duration-300 shadow-xl",
                        getStatusColor()
                    )}>
                        {status === 'processing' && <Loader2 className="h-12 w-12 animate-spin" />}
                        {status === 'valid' && <CheckCircle2 className="h-16 w-16" />}
                        {status === 'duplicate' && <AlertTriangle className="h-16 w-16" />}
                        {(status === 'invalid' || status === 'error') && <XCircle className="h-16 w-16" />}
                        {status === 'wrong-event' && <XOctagon className="h-16 w-16" />}
                    </div>

                    <h2 className={cn(
                        "text-3xl font-bold uppercase tracking-tight mb-2",
                        status === 'processing' ? "text-white" : getStatusColor().split(' ')[0]
                    )}>
                        {message}
                    </h2>

                    {details && status !== 'processing' && (
                        <div className="mt-4 w-full max-w-xs space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                                {details.attendeeName && (
                                    <div className="mb-3 pb-3 border-b border-white/5">
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Attendee</p>
                                        <p className="text-lg font-semibold text-white">{details.attendeeName}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    {details.ticketType && (
                                        <div className="text-left">
                                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Type</p>
                                            <div className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white border border-white/10">
                                                {details.ticketType}
                                            </div>
                                        </div>
                                    )}
                                    {details.purchaseDate && (
                                        <div className="text-left">
                                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Purchased</p>
                                            <p className="text-sm text-slate-300">
                                                {formatSafeDate(details.purchaseDate, (d) => formatDistanceToNow(d, { addSuffix: true }))}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {status === 'duplicate' && details.checkInTime && (
                                    <div className="mt-3 pt-3 border-t border-white/5 bg-yellow-500/10 -mx-4 -mb-4 p-3 rounded-b-xl">
                                        <p className="text-xs text-yellow-300 uppercase tracking-wider mb-1">Checked In At</p>
                                        <p className="text-sm font-medium text-yellow-200">
                                            {new Date(details.checkInTime).toLocaleTimeString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

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
