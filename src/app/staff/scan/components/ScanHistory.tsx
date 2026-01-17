import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ClipboardList, ArrowRight, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ValidationLog } from "../types";

interface ScanHistoryProps {
    logs: ValidationLog[];
    isLoading: boolean;
    eventId?: string;
}

export function ScanHistory({ logs, isLoading, eventId }: ScanHistoryProps) {
    const logsUrl = eventId 
        ? `/staff/validation-logs?eventId=${encodeURIComponent(eventId)}` 
        : "/staff/validation-logs";

    return (
        <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl p-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">Recent Validations</h3>
                </div>
                <Link
                    href={logsUrl}
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                    View All
                    <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            {isLoading && logs.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
            ) : logs.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                    No validations yet. Start scanning tickets!
                </p>
            ) : (
                <div className="space-y-2">
                    {logs.map((log) => {
                        const logIsValid = log.validationStatus === "VALID";
                        const isWrongEvent = log.ticketEventId && log.ticketEventId !== log.eventId;
                        // Logic mirrored from backend/client consistency
                        const isDuplicate = !logIsValid && !isWrongEvent && log.ticketStatus === "CHECKED_IN";

                        let statusColor = "text-red-400";
                        let statusBg = "bg-red-500/5 border-red-500/20";
                        let iconBg = "bg-red-500";
                        let StatusIcon = XCircle;
                        let statusText = "Invalid";

                        if (logIsValid) {
                            statusColor = "text-emerald-400";
                            statusBg = "bg-emerald-500/5 border-emerald-500/20";
                            iconBg = "bg-emerald-500";
                            StatusIcon = CheckCircle2;
                            statusText = "Valid";
                        } else if (isDuplicate) {
                            statusColor = "text-yellow-400";
                            statusBg = "bg-yellow-500/5 border-yellow-500/20";
                            iconBg = "bg-yellow-500";
                            StatusIcon = AlertTriangle;
                            statusText = "Duplicate";
                        }

                        return (
                            <div
                                key={log.id}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                    statusBg
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-lg bg-opacity-20",
                                        iconBg,
                                        statusColor
                                    )}>
                                        <StatusIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {statusText}
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
    );
}
