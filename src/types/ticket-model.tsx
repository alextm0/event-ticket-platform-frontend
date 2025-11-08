import { UUID } from "crypto";

type Ticket = {
    id: UUID;
    order_id: UUID;
    ticket_type: string,
    qr_code: string,
    status: "DEFAULT" | "PURCHASED" | "CHECKED_IN" | "NULL",
    checked_in_at: Date | null,
    created_at: Date,
    updated_at: Date,
};

export default Ticket;