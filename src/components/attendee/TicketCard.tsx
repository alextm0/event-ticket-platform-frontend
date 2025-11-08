import TicketDTO from '@/utils/ticket-model'
import React from 'react'
import './ticket-card.css'

type Props = { ticket: TicketDTO }

function TicketCard({ ticket }: Props) {
    const created = ticket?.created_at ? new Date(ticket.created_at).toLocaleString() : '—'
    const checked = ticket?.checked_in_at ? new Date(ticket.checked_in_at).toLocaleString() : null

    return (
        <article className="ticket-card" aria-labelledby={`ticket-${String(ticket.id)}`}>
            <header className="ticket-header">
                <h3 id={`ticket-${String(ticket.id)}`} className="ticket-type">
                    {ticket.ticket_type ?? 'Ticket'}
                </h3>
                <span className={`ticket-status status-${String(ticket.status || 'pending')}`}>
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
                    <pre aria-hidden>{ticket.qr_code ?? '—'}</pre>
                </div>
            </div>

            <div className="ticket-footer">
                <button className="btn-outline" type="button">Details</button>
                <button className="btn-primary" type="button">Download</button>
            </div>
        </article>
    )
}

export default TicketCard
