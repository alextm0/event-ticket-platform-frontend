
// src/app/staff/scan/page.tsx
"use client";

import { useState } from "react";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";

export default function StaffScanPage() {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length > 0) {
      const result = detectedCodes[0].rawValue;
      if (result && result !== scannedData) {
        setIsScanning(false); // Pause scanning after a successful decode
        setScannedData(result);
        setValidationMessage("Scanning...");
        setIsValid(null);

        try {
          const response = await fetch("/api/v1/ticket-validations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ticketId: result }),
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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Ticket Scanner</h1>

      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6">
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

        {scannedData && (
          <p className="text-center text-sm text-gray-400 mt-2">Last Scanned: {scannedData}</p>
        )}
      </div>
    </main>
  );
}
