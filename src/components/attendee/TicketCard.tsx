import Ticket from "@/types/ticket-model";
import React, { useEffect, useState } from "react";
import "./ticket-card.css";
import TicketDetailsModal from "./TicketDetailsModal";

type Props = { ticket: Ticket };

function TicketCard({ ticket }: Props) {
  const created = ticket?.created_at ? new Date(ticket.created_at).toLocaleString() : "—";
  const checked = ticket?.checked_in_at ? new Date(ticket.checked_in_at).toLocaleString() : null;

  const eventDate = ticket.event_start_time
    ? new Date(ticket.event_start_time).toLocaleString()
    : null;

  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchQr() {
      setLoadingQr(true);
      setQrError(null);
      try {
        const response = await fetch(`/api/tickets/${ticket.id}/qr-code`);
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.message || "Failed to load QR code");
        }
        const data = await response.json();
        if (cancelled) {
          return;
        }
        const src =
          data.codeData?.startsWith("data:")
            ? data.codeData
            : data.codeData
              ? `data:image/png;base64,${data.codeData}`
              : data.url ?? data.id ?? ticket.qr_code ?? ticket.qr_code_id ?? null;
        setQrSrc(src);
      } catch (error) {
        if (!cancelled) {
          setQrError(error instanceof Error ? error.message : "Failed to load QR code");
        }
      } finally {
        if (!cancelled) {
          setLoadingQr(false);
        }
      }
    }
    fetchQr();
    return () => {
      cancelled = true;
    };
  }, [ticket.id, ticket.qr_code, ticket.qr_code_id]);

  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <article className="ticket-card" aria-labelledby={`ticket-${String(ticket.id)}`}>
      <header className="ticket-header">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {ticket.event_title ?? "Event"}
          </p>
          <h3 id={`ticket-${String(ticket.id)}`} className="ticket-type">
            {ticket.ticket_type_name ?? ticket.ticket_type ?? "Ticket"}
          </h3>
        </div>
        <span className={`ticket-status status-${String(ticket.status.toLowerCase() || "pending")}`}>
          {ticket.status || "pending"}
        </span>
      </header>

      <div className="ticket-body">
        <div className="ticket-details">
          <dl>
            <div className="ticket-row">
              <dt>Ticket ID</dt>
              <dd>{String(ticket.id)}</dd>
            </div>
            <div className="ticket-row">
              <dt>Event</dt>
              <dd>{ticket.event_title ?? "—"}</dd>
            </div>
            <div className="ticket-row">
              <dt>Date</dt>
              <dd>{eventDate ?? "—"}</dd>
            </div>
            <div className="ticket-row">
              <dt>Location</dt>
              <dd>{ticket.event_location ?? "—"}</dd>
            </div>
            <div className="ticket-row">
              <dt>Created</dt>
              <dd>{created}</dd>
            </div>
            <div className="ticket-row">
              <dt>Checked in</dt>
              <dd>{checked ?? "Not checked in"}</dd>
            </div>
          </dl>
        </div>
        <div className="ticket-qr flex flex-col items-center justify-center">
          {loadingQr ? (
            <p className="text-xs text-slate-500">Loading QR…</p>
          ) : qrError ? (
            <p className="text-xs text-rose-400">{qrError}</p>
          ) : qrSrc ? (
            <img
              src={qrSrc}
              alt="Ticket QR"
              className="h-32 w-32 rounded bg-white p-2 object-contain"
            />
          ) : (
            <p className="text-xs text-slate-500">No QR available</p>
          )}
        </div>
      </div>
      <TicketDetailsModal isOpen={open} onClose={handleClose} ticket={ticket} />
      <div className="ticket-footer">
        <button className="btn-outline" type="button" onClick={handleOpen}>
          Details
        </button>
        <button className="btn-primary" type="button">
          Download
        </button>
      </div>
    </article>
  );
}

export default TicketCard;
