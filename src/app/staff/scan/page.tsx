
// src/app/staff/scan/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { validateTicket } from "@/lib/validate-ticket";
import {
  isTicketValid,
  getValidationMessage,
  sanitizeValidationErrorMessage,
} from "@/lib/ticket-validation-helpers";

interface AssignedEvent {
  eventId: string;
  eventName: string;
}

export default function StaffScanPage() {
  const [eventId, setEventId] = useState<string>("");
  const [assignedEvents, setAssignedEvents] = useState<AssignedEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch assigned events on component mount
  useEffect(() => {
    const fetchAssignedEvents = async () => {
      try {
        setLoadingEvents(true);
        setEventsError(null);

        // Get staff ID from localStorage (set during login)
        const staffId = localStorage.getItem("userId");
        if (!staffId) {
          setEventsError("Staff ID not found. Please log in again.");
          setLoadingEvents(false);
          return;
        }

        const response = await fetch(`/api/v1/events/staff/${staffId}/assigned-events`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setEventsError("Staff member not found");
          } else if (response.status === 403) {
            setEventsError("User is not a staff member");
          } else {
            setEventsError("Failed to load assigned events");
          }
          setLoadingEvents(false);
          return;
        }

        const data = await response.json();
        if (data.events && Array.isArray(data.events)) {
          setAssignedEvents(data.events);
          // Auto-select first event if available
          if (data.events.length > 0) {
            setEventId(data.events[0].eventId);
          }
        } else {
          setAssignedEvents([]);
        }
      } catch (error) {
        console.error("Error fetching assigned events:", error);
        setEventsError("Failed to load assigned events");
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchAssignedEvents();
  }, []);

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length > 0) {
      const result = detectedCodes[0].rawValue;
      if (result && result !== scannedData) {
        // Prevent validation if no event is selected
        if (!eventId) {
          setErrorMessage("Please select an event before scanning.");
          setIsValid(false);
          setValidationMessage("Please select an event before scanning.");
          // Clear message after a delay
          setTimeout(() => {
            setErrorMessage(null);
            setValidationMessage(null);
            setIsValid(null);
          }, 3000);
          return;
        }

        setIsScanning(false); // Pause scanning after a successful decode
        setScannedData(result);
        setValidationMessage("Scanning...");
        setIsValid(null);
        setErrorMessage(null);

        try {
          // validateTicket handles URL-encoding of result (as ticketId) when building the request path
          // The raw code is still sent in the JSON body if needed
          const data = await validateTicket(eventId, result, { code: result });
          
          const isValid = isTicketValid(data);
          const message = getValidationMessage(data);
          
          setValidationMessage(message);
          setIsValid(isValid);
        } catch (error) {
          console.error("Error validating ticket:", error);
          const errorMessage = sanitizeValidationErrorMessage(error);
          setValidationMessage(errorMessage);
          setIsValid(false);
        } finally {
          // Resume scanning after a short delay
          setTimeout(() => {
            setIsScanning(true);
            setScannedData(null); // Clear scanned data to allow rescanning the same QR code
            setValidationMessage(null);
            setIsValid(null);
          }, 3000); // Display message for 3 seconds
        }
      }
    }
  };

  const handleError = (error: unknown) => {
    console.error(error);
    setValidationMessage("Error scanning QR code.");
    setIsValid(false);
    setTimeout(() => {
      setIsScanning(true);
      setValidationMessage(null);
      setIsValid(null);
    }, 3000);
  };

  const getValidationMessageClass = () => {
    if (isValid === true) return "text-green-500";
    if (isValid === false) return "text-red-500";
    return "text-white";
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900 text-white relative">
      <Link
        href="/staff"
        className="absolute top-4 left-4 inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
      >
        <span aria-hidden="true">&lt;-</span> Back
      </Link>
      <h1 className="text-4xl font-bold mb-8">Ticket Scanner</h1>

      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
        <div>
          <label htmlFor="eventId" className="block text-sm font-medium text-gray-300 mb-1">
            Select Event
          </label>
          {loadingEvents ? (
            <div className="w-full rounded-md border border-gray-600 bg-gray-900 p-2 text-gray-400 text-sm">
              Loading assigned events...
            </div>
          ) : eventsError ? (
            <div className="w-full rounded-md border border-red-600 bg-gray-900 p-2 text-red-400 text-sm">
              {eventsError}
            </div>
          ) : assignedEvents.length === 0 ? (
            <div className="w-full rounded-md border border-yellow-600 bg-gray-900 p-2 text-yellow-400 text-sm">
              No events assigned to you
            </div>
          ) : (
            <>
              <select
                id="eventId"
                value={eventId}
                onChange={(event) => setEventId(event.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-900 p-2 text-white focus:border-sky-500 focus:outline-none"
              >
                <option value="">-- Select an event --</option>
                {assignedEvents.map((event) => (
                  <option key={event.eventId} value={event.eventId}>
                    {event.eventName}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select an event you're assigned to, then scan attendee tickets.
              </p>
            </>
          )}
        </div>

        <div className="relative w-full h-80 mb-6 overflow-hidden rounded-md">
          {!eventId ? (
            // Show message when no event is selected
            <div className="absolute inset-0 flex items-center justify-center text-center text-xl font-medium text-yellow-400 bg-gray-900 bg-opacity-95 p-4">
              Please select an event from the dropdown above to start scanning tickets.
            </div>
          ) : isScanning ? (
            <Scanner
              onScan={handleScan}
              onError={handleError}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { width: "100%", height: "100%", objectFit: "cover" },
              }}
            />
          ) : null}
          {!isScanning && validationMessage && eventId && (
            <div className={`absolute inset-0 flex items-center justify-center text-center text-5xl font-bold ${getValidationMessageClass()} bg-gray-900 bg-opacity-90`}>
              {validationMessage}
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="text-center text-sm text-red-400" role="alert">
            {errorMessage}
          </p>
        )}

        {scannedData && (
          <p className="text-center text-sm text-gray-400 mt-2">Last Scanned: {scannedData}</p>
        )}
      </div>
    </main>
  );
}
