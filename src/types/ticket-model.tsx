type Ticket = {
  id: string;
  order_id: string;
  event_id: string;
  ticket_type: string;
  qr_code: string;
  status: string;
  checked_in_at: string | null;
  created_at: string;
  updated_at: string;
  event_title?: string;
  event_location?: string;
  event_start_time?: string;
  event_end_time?: string;
  event_description?: string;
  ticket_type_name?: string;
  qr_code_id?: string;
  purchase_date?: string;
};

export default Ticket;