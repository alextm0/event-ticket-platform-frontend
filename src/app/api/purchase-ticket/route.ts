import { buyTicket } from '@/lib/backend-client';
import { NextRequest, NextResponse } from 'next/server';

interface PurchaseTicketRequest {
  eventId: string;
  ticketTypeId: string;
  quantity?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: PurchaseTicketRequest = await request.json();
    const { eventId, ticketTypeId, quantity = 1 } = body;

    if (!eventId || !ticketTypeId) {
      return NextResponse.json(
        { error: 'eventId and ticketTypeId are required' },
        { status: 400 }
      );
    }

    const result = await buyTicket(eventId, ticketTypeId, quantity);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error purchasing ticket:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to purchase ticket';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
