"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EventResponse, TicketTypePayload, EventPayload } from '@/types';
import { createEventAction, updateEventAction } from '@/app/organizer/create-event/actions';

interface TicketType extends TicketTypePayload {
  id?: string;
}

interface EventFormProps {
  event?: EventResponse;
  organizerId: string;
}

export const EventForm = ({ event, organizerId }: EventFormProps) => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setLocation(event.location);
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      // Assuming ticket types are not editable for now
    }
  }, [event]);

  const handleTicketTypeChange = (index: number, field: keyof TicketType, value: string | number) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index] = { ...newTicketTypes[index], [field]: value };
    setTicketTypes(newTicketTypes);
  };

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: '', price: 0, quantity: 0 }]);
  };

  const removeTicketType = (index: number) => {
    const newTicketTypes = ticketTypes.filter((_, i) => i !== index);
    setTicketTypes(newTicketTypes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start < now) {
      setError("Start time must be in the present or future.");
      setIsLoading(false);
      return;
    }

    if (end <= start) {
      setError("End time must be after the start time.");
      setIsLoading(false);
      return;
    }

    const payload: EventPayload = {
      organizerId,
      title,
      description,
      location,
      startTime: `${startTime}:00Z`,
      endTime: `${endTime}:00Z`,
      ticketTypes,
    };

    try {
      if (event) {
        await updateEventAction(event.id, payload);
      } else {
        await createEventAction(payload);
      }
      router.push('/organizer'); // Redirect to organizer dashboard
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      {error && <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="font-semibold text-gray-700 dark:text-gray-300">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="font-semibold text-gray-700 dark:text-gray-300">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="location" className="font-semibold text-gray-700 dark:text-gray-300">Location</label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="startTime" className="font-semibold text-gray-700 dark:text-gray-300">Start Time</label>
        <input
          type="datetime-local"
          id="startTime"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="endTime" className="font-semibold text-gray-700 dark:text-gray-300">End Time</label>
        <input
          type="datetime-local"
          id="endTime"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Ticket Types</h3>
        {ticketTypes.map((ticketType, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Name"
              value={ticketType.name}
              onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={ticketType.price}
              onChange={(e) => handleTicketTypeChange(index, 'price', parseFloat(e.target.value))}
              className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={ticketType.quantity}
              onChange={(e) => handleTicketTypeChange(index, 'quantity', parseInt(e.target.value))}
              className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button type="button" onClick={() => removeTicketType(index)} className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addTicketType} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">Add Ticket Type</button>
      </div>

      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading}>
        {isLoading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
      </button>
    </form>
  );
};
