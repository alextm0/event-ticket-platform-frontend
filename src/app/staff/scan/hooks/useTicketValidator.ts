import { useState, useCallback } from 'react';
import { validateTicket } from "@/lib/validation/client";
import { isTicketValid, getValidationMessage, sanitizeValidationErrorMessage } from "@/lib/validation/helpers";
import { ScanStatus, ScanResultDetails, ValidationLog } from '../types';

interface UseTicketValidatorProps {
    eventId: string;
    userId: string;
    onValidationComplete?: () => void;
}

export function useTicketValidator({ eventId, userId, onValidationComplete }: UseTicketValidatorProps) {
    const [status, setStatus] = useState<ScanStatus>('idle');
    const [message, setMessage] = useState<string | null>(null);
    const [details, setDetails] = useState<ScanResultDetails | null>(null);
    const [recentLogs, setRecentLogs] = useState<ValidationLog[]>([]);

    const fetchLogs = useCallback(async () => {
        if (!eventId || !userId) return;
        try {
            const response = await fetch(`/api/events/${eventId}/validation-logs`, {
                cache: "no-store",
                headers: { "X-User-Id": userId } // Ensure header is present for backend
            });
            if (response.ok) {
                const logs = await response.json();
                setRecentLogs(logs.slice(0, 5));
            }
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        }
    }, [eventId, userId]);

    const validate = useCallback(async (code: string) => {
        if (!eventId) return;

        setStatus('processing');
        setMessage("Validating...");
        setDetails(null);

        try {
            const data = await validateTicket(eventId, code, { code });

            const valid = isTicketValid(data);
            const msg = getValidationMessage(data);

            // Logic to determine specific status
            const isWrongEvent = data.ticketEventId && data.ticketEventId !== eventId;
            const isDuplicate = !valid && !isWrongEvent && data.ticketStatus === "CHECKED_IN";

            let newStatus: ScanStatus = 'invalid';
            if (valid) newStatus = 'valid';
            // Note: isWrongEvent check prevents it from falling into duplicate
            else if (isDuplicate) newStatus = 'duplicate';

            setStatus(newStatus);

            // Override backend message for wrong events to be generic "Invalid"
            // as per user request to not show "Valid for another event"
            setMessage(isWrongEvent ? "Invalid Ticket" : msg);

            // Construct details object
            // Define an interface for the raw data to avoid 'any' usage
            interface RawTicketData {
                attendeeName?: string;
                user?: { fullName?: string; name?: string };
                ownerName?: string;
                ticketType?: { name: string } | string;
                ticketTypeName?: string;
                purchaseDate?: string;
                createdAt?: string;
                checkedInAt?: string;
            }

            const rawData = data as unknown as RawTicketData;

            if (valid || isDuplicate || isWrongEvent) {
                const resultDetails: ScanResultDetails = {
                    ticketId: data.ticketId || code,
                    attendeeName: rawData.attendeeName || rawData.user?.fullName || rawData.user?.name || rawData.ownerName,
                    ticketType: typeof rawData.ticketType === 'object' ? rawData.ticketType?.name : (rawData.ticketType || rawData.ticketTypeName),
                    purchaseDate: rawData.purchaseDate || rawData.createdAt,
                };
                if (isDuplicate) {
                    resultDetails.checkInTime = rawData.checkedInAt;
                }
                setDetails(resultDetails);
            }

            // Refresh logs
            await fetchLogs();

        } catch (error) {
            console.error("Validation error:", error);
            setStatus('error');
            setMessage(sanitizeValidationErrorMessage(error));
        } finally {
            if (onValidationComplete) onValidationComplete();
        }
    }, [eventId, fetchLogs, onValidationComplete]);

    const reset = useCallback(() => {
        setStatus('idle');
        setMessage(null);
        setDetails(null);
    }, []);

    return {
        status,
        message,
        details,
        recentLogs,
        validate,
        reset,
        refreshLogs: fetchLogs,
        fetchLogs
    };
}
