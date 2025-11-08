import { UUID } from "crypto";

type TicketDTO = {
    id: UUID;
    order_id: UUID;
    ticket_type: string,
    qr_code: string,
    status: "",
    checked_in_at: Date | null,
    created_at: Date,
    updated_at: Date,
    ticket_validations: string
};

export default TicketDTO;