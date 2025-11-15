
export interface TicketType {
  id: string;
  event_id: number;
  name: string;
  description: string;
  price: number;
  total_quantity: number;
  sold_count: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}