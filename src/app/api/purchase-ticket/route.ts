import { buyTicket } from '@/lib/backend-client';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface PurchaseTicketRequest {
  eventId: string;
  ticketTypeId: string;
  quantity?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    const userRole = cookieStore.get("userRole")?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to purchase tickets.' },
        { status: 401 }
      );
    }

    // Only attendees can purchase tickets
    if (userRole !== 'attendee') {
      return NextResponse.json(
        { error: 'Only attendees can purchase tickets. Staff and organizers cannot purchase tickets.' },
        { status: 403 }
      );
    }

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
