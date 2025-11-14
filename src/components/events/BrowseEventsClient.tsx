'use client';

import { useState } from "react";
import { mockedEvents } from "@/lib/mocked-data";

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
}


// Mocked ticket types for demonstration
const TICKET_TYPES: TicketType[] = [
  { id: "general", name: "General Admission", price: 50, quantity: 100 },
  { id: "vip", name: "VIP", price: 150, quantity: 50 },
  { id: "premium", name: "Premium VIP", price: 300, quantity: 20 },
];

export default function BrowseEventsClient() {
  const [selectedEvent, setSelectedEvent] = useState<typeof mockedEvents[0] | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({ cardName: "", cardNumber: "", expiry: "", cvv: "" });
  const [loading, setLoading] = useState(false);

  // TODO: Replace mockedEvents usage with a real API call to fetch events

  const handleBuyTicket = () => {
    setShowPayment(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Call payment and order API?

    // Mock payment processing (keep for now)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (!selectedEvent || !selectedTicket) {
      setLoading(false);
      return;
    }
    const ticket = TICKET_TYPES.find((t) => t.id === selectedTicket);
    if (!ticket) {
      setLoading(false);
      return;
    }

    const total = ticket.price * quantity;
    alert(`✓ Purchase successful!\n\n${quantity}x ${ticket.name} for ${selectedEvent.name}\nTotal: $${total}\n\nConfirmation sent to email.`);
    
    // TODO: After success, call API to persist purchase and create tickets and qr codes

    // Reset state
    setSelectedEvent(null);
    setSelectedTicket(null);
    setQuantity(1);
    setShowPayment(false);
    setPaymentData({ cardName: "", cardNumber: "", expiry: "", cvv: "" });
    setLoading(false);
  };

  if (showPayment && selectedEvent && selectedTicket) {
    const ticket = TICKET_TYPES.find((t) => t.id === selectedTicket);
    const total = (ticket?.price || 0) * quantity;

    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Payment</h2>

          <div className="mb-6 p-4 rounded-lg bg-slate-800 border border-slate-700">
            <p className="text-slate-300"><span className="font-semibold">{selectedEvent.name}</span> - {quantity}x {ticket?.name}</p>
            <p className="text-2xl font-bold text-sky-400 mt-2">${total}</p>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cardholder Name</label>
              <input
                type="text"
                required
                value={paymentData.cardName}
                onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500"
                placeholder="John Doe"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Card Number</label>
              <input
                type="text"
                required
                maxLength={16}
                value={paymentData.cardNumber}
                onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value.replace(/\D/g, "") })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500"
                placeholder="1234 5678 9012 3456"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Expiry (MM/YY)</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={paymentData.expiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.length >= 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                    setPaymentData({ ...paymentData, expiry: val });
                  }}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500"
                  placeholder="12/25"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">CVV</label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={paymentData.cvv}
                  onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value.replace(/\D/g, "") })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500"
                  placeholder="123"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => setShowPayment(false)}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-medium disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Processing..." : "Pay $" + total}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-100 mb-8">Browse Events</h1>

      {!selectedEvent ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockedEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-lg border border-slate-800 bg-slate-900 p-5 cursor-pointer hover:bg-slate-800 transition"
              onClick={() => setSelectedEvent(event)}
            >
              <h2 className="text-xl font-semibold text-slate-100">{event.name}</h2>
              <p className="mt-2 text-sm text-slate-400">{event.description}</p>
              <p className="mt-3 text-sm text-slate-500">
                📍 {event.location}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                📅 {new Date(event.date).toLocaleDateString("en-US", { timeZone: "UTC" })}
              </p>
              <button className="mt-4 inline-block px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded text-sm font-medium">
                View & Buy Tickets
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-8">
          <button
            onClick={() => {
              setSelectedEvent(null);
              setSelectedTicket(null);
            }}
            className="mb-6 text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <span>&lt;-</span> Back to Events
          </button>

          <h2 className="text-2xl font-bold text-slate-100">{selectedEvent.name}</h2>
          <p className="mt-2 text-slate-400">{selectedEvent.description}</p>
          <p className="mt-2 text-slate-500">📍 {selectedEvent.location}</p>
          <p className="mt-1 text-slate-500">📅 {new Date(selectedEvent.date).toLocaleDateString("en-US", { timeZone: "UTC" })}</p>
          <p className="mt-1 text-slate-500">🎫 Organized by {selectedEvent.organizer.name}</p>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Select Ticket Type</h3>
            <div className="space-y-3">
              {TICKET_TYPES.map((ticket) => (
                <label
                  key={ticket.id}
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${
                    selectedTicket === ticket.id
                      ? "border-sky-600 bg-sky-900 bg-opacity-20"
                      : "border-slate-800 bg-slate-800 hover:bg-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="ticket-type"
                    value={ticket.id}
                    checked={selectedTicket === ticket.id}
                    onChange={(e) => setSelectedTicket(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-100">{ticket.name}</p>
                    <p className="text-sm text-slate-400">${ticket.price} each</p>
                  </div>
                  <p className="text-sm text-slate-500">{ticket.quantity} available</p>
                </label>
              ))}
            </div>
          </div>

          {selectedTicket && (
            <div className="mt-8 p-4 rounded-lg border border-slate-800 bg-slate-800">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-slate-300">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
              <div className="text-lg font-semibold text-slate-100">
                Total: ${(TICKET_TYPES.find((t) => t.id === selectedTicket)?.price || 0) * quantity}
              </div>
              <button
                onClick={handleBuyTicket}
                className="mt-4 w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
              >
                Buy Ticket
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}