
// src/app/staff/scan/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";

export default function StaffScanPage() {
  const [eventId, setEventId] = useState<string>("");
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length > 0) {
      const result = detectedCodes[0].rawValue;
      if (result && result !== scannedData) {
        if (!eventId) {
          setErrorMessage("Enter an event ID before scanning.");
          return;
        }

        setIsScanning(false); // Pause scanning after a successful decode
        setScannedData(result);
        setValidationMessage("Scanning...");
        setIsValid(null);
        setErrorMessage(null);

        try {
          const response = await fetch("/api/v1/ticket-validations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ticketId: result, eventId }),
          });

          const data = await response.json();

          if (response.ok) {
            setValidationMessage("VALID");
            setIsValid(true);
          } else {
            setValidationMessage(data.message || "INVALID");
            setIsValid(false);
          }
        } catch (error) {
          console.error("Error validating ticket:", error);
          setValidationMessage("Error validating ticket.");
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
            Event ID
          </label>
          <input
            id="eventId"
            type="text"
            value={eventId}
            onChange={(event) => setEventId(event.target.value.trim())}
            placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
            className="w-full rounded-md border border-gray-600 bg-gray-900 p-2 text-white focus:border-sky-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Paste the backend event UUID staff is assigned to, then scan attendee tickets.
          </p>
        </div>

        <div className="relative w-full h-80 mb-6 overflow-hidden rounded-md">
          {isScanning && (
            <Scanner
              onScan={handleScan}
              onError={handleError}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { width: "100%", height: "100%", objectFit: "cover" },
              }}
            />
          )}
          {!isScanning && validationMessage && (
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
