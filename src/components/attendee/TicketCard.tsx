import Ticket from '@/types/ticket-model'
import React from 'react'
import QRCode from "react-qr-code";
import './ticket-card.css'
import TicketDetailsModal from './TicketDetailsModal';

type Props = { ticket: Ticket }

function TicketCard({ ticket }: Props) {
    const created = ticket?.created_at ? new Date(ticket.created_at).toLocaleString() : '—'
    const checked = ticket?.checked_in_at ? new Date(ticket.checked_in_at).toLocaleString() : null
    
    // ticket details moddal
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
                <h3 id={`ticket-${String(ticket.id)}`} className="ticket-type">
                    {ticket.ticket_type ?? 'Ticket'}
                </h3>
                <span className={`ticket-status status-${String(ticket.status.toLowerCase() || 'pending')}`}>
                    {ticket.status || 'pending'}
                </span>
            </header>

            <div className="ticket-body">
                <div className="ticket-details">
                    <dl>
                        <div className="ticket-row">
                            <dt>ID</dt>
                            <dd>{String(ticket.id)}</dd>
                        </div>
                        <div className="ticket-row">
                            <dt>Order</dt>
                            <dd>{String(ticket.order_id)}</dd>
                        </div>
                        <div className="ticket-row">
                            <dt>Created</dt>
                            <dd>{created}</dd>
                        </div>
                        <div className="ticket-row">
                            <dt>Checked in</dt>
                            <dd>{checked ?? 'Not checked in'}</dd>
                        </div>
                    </dl>
                </div>

                <div className="ticket-qr">
                    <QRCode value={ticket.qr_code ?? '—'} size={128}  />
                </div>

            </div>
            <TicketDetailsModal  isOpen={open} onClose={handleClose} ticket={ticket}/>
            <div className="ticket-footer">
                <button className="btn-outline" type="button" onClick={handleOpen}>Details</button>
                <button className="btn-primary" type="button">Download</button>
            </div>
        </article>
    )
}

export default TicketCard
