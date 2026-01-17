"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, QrCode, Calendar, AlertTriangle } from "lucide-react";
import { TicketValidationLog } from "@/lib/backend-client";
import { formatDistanceToNow, format } from "date-fns";

// Helper to determine status - matches the logic from ScanHistory component EXACTLY
function getValidationDisplayInfo(log: TicketValidationLog, currentEventId: string) {
  const logIsValid = log.validationStatus === "VALID";
  const isWrongEvent = log.ticketEventId && log.ticketEventId !== currentEventId;
  // Logic mirrored from backend/client consistency - EXACT same as ScanHistory
  const isDuplicate = !logIsValid && !isWrongEvent && log.ticketStatus === "CHECKED_IN";

  if (logIsValid) {
    return {
      label: "Valid",
      bgClass: "bg-emerald-500/20 text-emerald-400",
      borderClass: "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40",
      iconBgClass: "bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30",
      Icon: CheckCircle2,
    };
  } else if (isDuplicate) {
    return {
      label: "Duplicate",
      bgClass: "bg-yellow-500/20 text-yellow-400",
      borderClass: "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/40",
      iconBgClass: "bg-yellow-500/20 text-yellow-400 group-hover:bg-yellow-500/30",
      Icon: AlertTriangle,
    };
  } else {
    return {
      label: "Invalid",
      bgClass: "bg-red-500/20 text-red-400",
      borderClass: "border-red-500/20 bg-red-500/5 hover:border-red-500/40",
      iconBgClass: "bg-red-500/20 text-red-400 group-hover:bg-red-500/30",
      Icon: XCircle,
    };
  }
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ValidationLogsListProps {
  eventId: string;
  eventName?: string;
}

export function ValidationLogsList({ eventId, eventName }: ValidationLogsListProps) {
  const [logs, setLogs] = useState<TicketValidationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<TicketValidationLog | null>(null);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/events/${eventId}/validation-logs`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: `HTTP ${response.status}`,
          }));
          throw new Error(errorData.error || `Failed to fetch validation logs (${response.status})`);
        }

        const validationLogs = await response.json();
        setLogs(validationLogs);
      } catch (err: any) {
        console.error("Failed to fetch validation logs", err);
        setError(err.message || "Failed to load validation logs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [eventId]);

  useEffect(() => {
    if (selectedLog?.ticketId) {
      setIsLoadingDetails(true);
      fetch(`/api/tickets/${selectedLog.ticketId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch ticket");
        })
        .then((data) => {
          setTicketDetails(data);
        })
        .catch((err) => {
          console.error(err);
          setTicketDetails(null);
        })
        .finally(() => setIsLoadingDetails(false));
    } else {
      setTicketDetails(null);
    }
  }, [selectedLog]);

  if (isLoading) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-6 backdrop-blur-md">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
            <p className="text-sm text-[var(--color-secondary)]">Loading validation logs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-red-500/20 bg-red-500/10 p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 text-red-400">
          <XCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-6 backdrop-blur-md">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <QrCode className="h-12 w-12 text-[var(--color-secondary)] mb-4 opacity-50" />
          <p className="text-sm font-medium text-white mb-1">No validation logs yet</p>
          <p className="text-xs text-[var(--color-secondary)]">
            Validation attempts will appear here once tickets are scanned
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-6 backdrop-blur-md">
        {eventName && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-1">{eventName}</h3>
            <p className="text-xs text-[var(--color-secondary)]">
              {logs.length} validation{logs.length !== 1 ? "s" : ""} recorded
            </p>
          </div>
        )}

        <div className="space-y-3">
          {logs.map((log) => {
            const displayInfo = getValidationDisplayInfo(log, eventId);
            const validatedDate = new Date(log.validatedAt);
            const Icon = displayInfo.Icon;

            return (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`group cursor-pointer rounded-[var(--radius-lg)] border p-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg ${displayInfo.borderClass}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${displayInfo.iconBgClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${displayInfo.bgClass}`}>
                          {displayInfo.label}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-500/20 px-2 py-0.5 text-xs font-medium text-slate-400">
                          {log.validationMethod === "QR_SCAN" ? "QR Scan" : "Manual"}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2 text-[var(--color-secondary)]">
                          <QrCode className="h-3 w-3" />
                          <span className="font-mono truncate">Ticket: {log.ticketId ? log.ticketId.slice(0, 8) : "Unknown"}...</span>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--color-secondary)]">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(validatedDate, "MMM d, yyyy 'at' h:mm a")} (
                            {formatDistanceToNow(validatedDate, { addSuffix: true })})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="bg-[#1a1d23] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Validation Details</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6">
              {/* Status Badge */}
              {(() => {
                const info = getValidationDisplayInfo(selectedLog, eventId);
                const IconComponent = info.Icon;
                return (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className={`rounded-full p-4 ${info.bgClass}`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <span className={`text-lg font-semibold ${info.bgClass.includes('emerald') ? 'text-emerald-400' : info.bgClass.includes('yellow') ? 'text-yellow-400' : 'text-red-400'}`}>
                      {info.label}
                    </span>
                  </div>
                );
              })()}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs uppercase tracking-wider">Validation Status</p>
                  <p className="font-medium">{selectedLog.validationStatus}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs uppercase tracking-wider">Method</p>
                  <p className="font-medium">{selectedLog.validationMethod}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-slate-400 text-xs uppercase tracking-wider">Scanned At</p>
                  <p className="font-medium">
                    {format(new Date(selectedLog.validatedAt), "PPPP 'at' pp")}
                  </p>
                </div>

                {/* Fetched Ticket Details */}
                {isLoadingDetails ? (
                  <div className="col-span-2 py-4 flex justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                  </div>
                ) : ticketDetails ? (
                  <>
                    <div className="col-span-2 pt-4 border-t border-white/10">
                      <h4 className="font-medium text-emerald-400 mb-2">Ticket Information</h4>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-400 text-xs uppercase tracking-wider">Type</p>
                      <p className="font-medium">{ticketDetails.ticket_type_name || "Standard"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 text-xs uppercase tracking-wider">Purchase Date</p>
                      <p className="font-medium">
                        {ticketDetails.purchase_date
                          ? format(new Date(ticketDetails.purchase_date), "MMM d, yyyy")
                          : "N/A"}
                      </p>
                    </div>
                    <div className="col-span-2 space-y-1 bg-black/20 p-2 rounded border border-white/5 font-mono text-xs text-slate-400 break-all">
                      ID: {selectedLog.ticketId}
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 pt-2 text-center text-slate-500 text-xs">
                    Could not load additional ticket details.
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
