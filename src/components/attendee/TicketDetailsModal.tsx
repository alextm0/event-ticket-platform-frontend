import Ticket from '@/types/ticket-model';
import React from 'react'
import QRCode from 'react-qr-code';

type TicketDetailsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children?: React.ReactNode;
    ticket: Ticket;
}

function TicketDetailsModal({ isOpen, onClose, children, ticket }: TicketDetailsModalProps)  {
    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg bg-slate-800 shadow-2xl"
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-slate-800 px-6 py-4">
                    <h2 className="text-xl font-semibold text-slate-100">Ticket Details</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                        aria-label="Close modal"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="max-h-[calc(90vh-80px)] overflow-y-auto px-6 py-4">
                    <div className="space-y-4">
                        {/* Ticket ID */}
                        <div className="rounded-lg bg-slate-700 p-4">
                            <p className="text-sm text-slate-400">Ticket ID</p>
                            <p className="mt-1 text-lg font-medium text-slate-100">{String(ticket.id)}</p>
                        </div>
                        {/* QR Code */}
                         <div className="rounded-lg bg-slate-700 p-4 flex justify-center items-center">
                            <QRCode value={ticket.qr_code ?? '—'} size={128} style={{ height: "auto", width: "40%"  }}/>
                        </div>
                        {/* Order ID */}
                        <div className="rounded-lg bg-slate-700 p-4">
                            <p className="text-sm text-slate-400">Order ID</p>
                            <p className="mt-1 text-lg font-medium text-slate-100">{String(ticket.order_id)}</p>
                        </div>

                        {/* Event ID */}
                        <div className="rounded-lg bg-slate-700 p-4">
                            <p className="text-sm text-slate-400">Event ID</p>
                            <p className="mt-1 text-lg font-medium text-slate-100">{String(ticket.event_id)}</p>
                        </div>

                        {/* Status */}
                        {ticket.status && (
                            <div className="rounded-lg bg-slate-700 p-4">
                                <p className="text-sm text-slate-400">Status</p>
                                <p className="mt-1 text-lg font-medium text-slate-100 capitalize">{ticket.status}</p>
                            </div>
                        )}

                        {/* Created At */}
                        {ticket.created_at && (
                            <div className="rounded-lg bg-slate-700 p-4">
                                <p className="text-sm text-slate-400">Created At</p>
                                <p className="mt-1 text-lg font-medium text-slate-100">
                                    {new Date(ticket.created_at).toLocaleString()}
                                </p>
                            </div>
                        )}

                        {children}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TicketDetailsModal