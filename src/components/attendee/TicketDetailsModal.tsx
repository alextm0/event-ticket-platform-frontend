import Ticket from "@/types/ticket-model";
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";

type TicketDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  ticket: Ticket;
};

type QrCodeResponse = {
  id: string;
  url?: string;
  codeData?: string;
  status?: string;
  generatedAt?: string;
};

function TicketDetailsModal({ isOpen, onClose, children, ticket }: TicketDetailsModalProps) {
  const [qrCode, setQrCode] = useState<QrCodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;
    async function fetchQr() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/tickets/${ticket.id}/qr-code`, {
          method: "GET",
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.message || "Failed to load QR code");
        }

        const data = await response.json();
        if (!cancelled) {
          setQrCode(data);
        }
      } catch (err) {
        console.error("Failed to fetch ticket QR code", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load QR code");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchQr();

    return () => {
      cancelled = true;
    };
  }, [isOpen, ticket.id]);

  if (!isOpen) return null;

  const qrDataUrl = qrCode?.codeData
    ? qrCode.codeData.startsWith("data:")
      ? qrCode.codeData
      : `data:image/png;base64,${qrCode.codeData}`
    : null;

  const qrValueForGenerator =
    qrCode?.url ?? qrCode?.id ?? ticket.qr_code ?? ticket.qr_code_id ?? "";

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
            className="text-slate-400 transition-colors hover:text-slate-200"
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
            {/* Event overview */}
            <div className="rounded-lg bg-slate-700 p-4 space-y-2">
              <p className="text-sm uppercase tracking-wide text-slate-400">Event</p>
              <p className="text-lg font-semibold text-slate-100">{ticket.event_title ?? "Event"}</p>
              {ticket.event_description ? (
                <p className="text-sm text-slate-400">{ticket.event_description}</p>
              ) : null}
              <div className="text-sm text-slate-400 space-y-1">
                {ticket.event_location ? <p>📍 {ticket.event_location}</p> : null}
                {ticket.event_start_time ? (
                  <p>🗓 {new Date(ticket.event_start_time).toLocaleString()}</p>
                ) : null}
              </div>
            </div>
            {/* QR Code */}
            <div className="rounded-lg bg-slate-700 p-4 flex flex-col items-center justify-center gap-3">
              {loading ? (
                <p className="text-sm text-slate-400">Generating QR code…</p>
              ) : error ? (
                <p className="text-sm text-rose-300">{error}</p>
              ) : qrDataUrl || qrValueForGenerator ? (
                <>
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Ticket QR code"
                      className="max-w-[200px] rounded bg-white p-2"
                    />
                  ) : (
                    <QRCode
                      value={qrValueForGenerator}
                      size={180}
                      style={{ height: "auto", width: "100%", maxWidth: "200px" }}
                    />
                  )}
                  {qrCode?.status ? (
                    <p className="text-xs uppercase tracking-wide text-slate-400">Status: {qrCode.status}</p>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-slate-400">No QR code available.</p>
              )}
            </div>
            {/* Ticket summary */}
            <div className="rounded-lg bg-slate-700 p-4">
              <p className="text-sm text-slate-400">Ticket type</p>
              <p className="mt-1 text-lg font-medium text-slate-100">
                {ticket.ticket_type_name ?? ticket.ticket_type ?? "Ticket"}
              </p>
              {ticket.purchase_date ? (
                <p className="mt-2 text-xs text-slate-400">
                  Purchased {new Date(ticket.purchase_date).toLocaleString()}
                </p>
              ) : null}
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
}

export default TicketDetailsModal;