export interface ValidationLog {
    id: string;
    eventId: string;
    ticketId: string;
    validationStatus: string;
    ticketStatus: string;
    validatedAt: string;
    ticketEventId?: string;
}

export interface ScanResultDetails {
    attendeeName?: string;
    ticketType?: string;
    ticketId?: string;
    purchaseDate?: string;
    checkInTime?: string;
}

export type ScanStatus = 'idle' | 'processing' | 'valid' | 'invalid' | 'duplicate' | 'wrong-event' | 'error';
