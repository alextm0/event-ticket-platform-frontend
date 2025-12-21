"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { validateTicket } from "@/lib/validation/client";
import {
  isTicketValid,
  getValidationMessage,
  sanitizeValidationErrorMessage,
} from "@/lib/validation/helpers";

interface ValidationPopup {
  show: boolean;
  isValid: boolean;
  message: string;
}

interface Props {
  eventId?: string;
}

export default function QRScannerClient({ eventId }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrData, setQrData] = useState<string>("");
  const [popup, setPopup] = useState<ValidationPopup>({ show: false, isValid: false, message: "" });
  const lastScannedRef = useRef<string>("");
  const lastScannedTimeRef = useRef<number>(0);
  const popupRef = useRef<ValidationPopup>(popup);
  const COOLDOWN_MS = 2000; // Allow re-scanning same code after 2 seconds

  const handleTicketValidation = useCallback(
    async (data: string) => {
      // Prevent validation if no event is selected
      if (!eventId) {
        setPopup({
          show: true,
          isValid: false,
          message: "Please select an event before scanning tickets."
        });
        return;
      }

      try {
        const result = await validateTicket(eventId, data, { code: data });

        const isValid = isTicketValid(result);
        const message = getValidationMessage(result);

        setPopup({ show: true, isValid, message });
      } catch (err) {
        // Silently handle error and show user-friendly message
        const errorMessage = sanitizeValidationErrorMessage(err);
        setPopup({ show: true, isValid: false, message: errorMessage });
      }
    },
    [eventId],
  );

  useEffect(() => {
    popupRef.current = popup;
  }, [popup]);

  useEffect(() => {
    // Don't start camera if no event is selected
    if (!eventId) {
      return;
    }

    let animationFrameId: number | null = null;
    const videoElement = videoRef.current;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (!videoRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();

        const scan = () => {
          if (popupRef.current.show) {
            animationFrameId = requestAnimationFrame(scan);
            return;
          }

          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const context = canvas.getContext("2d");
            if (!context) return;

            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);
            const now = Date.now();
            // Allow scanning if it's a different code, or if it's been more than COOLDOWN_MS since last scan
            if (code && (code.data !== lastScannedRef.current || (now - lastScannedTimeRef.current) > COOLDOWN_MS)) {
              lastScannedRef.current = code.data;
              lastScannedTimeRef.current = now;
              setQrData(code.data);
              // handleTicketValidation will check if eventId is present and prevent validation
              handleTicketValidation(code.data);
            }
          }
          animationFrameId = requestAnimationFrame(scan);
        };

        scan();
      } catch (err) {
        console.error("Error accessing camera:", err);
        setPopup({ show: true, isValid: false, message: "Camera access error" });
      }
    }

    startCamera();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (videoElement?.srcObject) {
        (videoElement.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      }
    };
  }, [eventId, handleTicketValidation]);

  return (
    <>
      <video ref={videoRef} style={{ width: "100%", border: "1px solid #ccc" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h2>Scanned Ticket Details:</h2>
        {qrData ? <pre>{qrData}</pre> : <p>No QR code scanned yet.</p>}
      </div>

      {popup.show && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            fontSize: "20px",
            fontWeight: "bold",
            borderRadius: "10px",
            color: "white",
            backgroundColor: popup.isValid ? "#28a745" : "#dc3545",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            maxWidth: "90vw",
            maxHeight: "80vh",
            overflow: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {popup.message}
          <button
            onClick={() => {
              setPopup({ show: false, isValid: false, message: "" });
              // Reset after a short delay to allow immediate re-scanning
              setTimeout(() => {
                lastScannedRef.current = "";
                lastScannedTimeRef.current = 0;
              }, 500);
            }}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: "bold",
              border: "none",
              borderRadius: "5px",
              backgroundColor: "white",
              color: popup.isValid ? "#28a745" : "#dc3545",
              cursor: "pointer",
            }}
          >
            Continue
          </button>
        </div>
      )}
    </>
  );
}
