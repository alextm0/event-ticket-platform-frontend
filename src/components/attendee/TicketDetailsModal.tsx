"use client";

import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import type { Ticket } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, User, Download, Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { shareTicket } from "@/lib/share-utils";

type TicketDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
};

type QrCodeResponse = {
  id: string;
  url?: string;
  codeData?: string;
  status?: string;
  generatedAt?: string;
};

// Simple Separator if not available in UI components yet
const Divider = () => <div className="h-[1px] w-full bg-dashed border-t border-dashed border-[var(--color-border)] my-4" />;


export default function TicketDetailsModal({ isOpen, onClose, ticket }: TicketDetailsModalProps) {
  const [qrCode, setQrCode] = useState<QrCodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    async function fetchQr() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/tickets/${ticket.id}/qr-code`);
        if (!response.ok) throw new Error("Failed to load QR code");
        const data = await response.json();
        if (!cancelled) setQrCode(data);
      } catch (err) {
        if (!cancelled) setError("Failed to load QR");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchQr();
    return () => { cancelled = true; };
  }, [isOpen, ticket.id]);

  const qrDataUrl = qrCode?.codeData?.startsWith("data:")
    ? qrCode.codeData
    : qrCode?.codeData
      ? `data:image/png;base64,${qrCode.codeData}`
      : null;

  const qrValue = qrCode?.url ?? qrCode?.id ?? ticket.qr_code ?? ticket.qr_code_id ?? "inv";

  const eventDate = ticket.event_start_time ? new Date(ticket.event_start_time) : null;

  const handleShare = async () => {
    setSharing(true);
    setShareSuccess(false);
    setError(null);

    try {
      const success = await shareTicket(ticket.id, ticket.event_title);
      if (success) {
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } else {
        setError("Failed to share ticket");
      }
    } catch (err) {
      setError("Failed to share ticket");
      console.error("Error sharing ticket:", err);
    } finally {
      setSharing(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    setError(null);
    
    let objectUrl: string | null = null;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`/api/tickets/${ticket.id}/download`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Try to parse error response
        const errorData = await response.json().catch(() => ({
          message: `Failed to download ticket PDF (${response.status})`,
        }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create a temporary download link
      objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      
      // Get filename from Content-Disposition header (backend sets this correctly)
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `ticket-${ticket.id}.pdf`;
      if (contentDisposition) {
        // Try RFC 5987 encoded filename first
        const encodedMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
        if (encodedMatch) {
          filename = decodeURIComponent(encodedMatch[1]);
        } else {
          // Fall back to basic filename
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"|filename=([^;]+)/);
          if (filenameMatch) {
            filename = (filenameMatch[1] || filenameMatch[2]).trim();
          }
        }
      }
      
      link.download = filename;

      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to download ticket PDF";
      setError(errorMessage);
      console.error("Error downloading ticket PDF:", err);
    } finally {
      // Clean up the URL object
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
      setDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-transparent border-none shadow-2xl">
        <DialogTitle className="sr-only">
          Ticket Details - {ticket.event_title}
        </DialogTitle>
        <div className="relative flex flex-col w-full bg-[var(--color-surface)] rounded-3xl overflow-hidden border border-[var(--color-border)]">
          {/* Top colored visualization */}
          <div className="h-32 bg-gradient-to-br from-emerald-900 to-[#1a1d23] relative p-6 flex flex-col justify-end">
            <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <p className="relative z-10 text-emerald-400 font-bold tracking-widest text-xs uppercase mb-1">Pass</p>
            <h2 className="relative z-10 text-white text-2xl font-bold leading-tight line-clamp-2">
              {ticket.event_title}
            </h2>
          </div>

          <div className="p-6 pt-4 space-y-4">

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-secondary)]">Date</p>
                <div className="flex items-center text-white text-sm font-medium">
                  <Calendar className="w-3 h-3 mr-1.5 text-emerald-500" />
                  <span suppressHydrationWarning>{eventDate ? eventDate.toLocaleDateString() : 'TBD'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-secondary)]">Time</p>
                <div className="flex items-center text-white text-sm font-medium">
                  <Clock className="w-3 h-3 mr-1.5 text-emerald-500" />
                  <span suppressHydrationWarning>{eventDate ? eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</span>
                </div>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-secondary)]">Location</p>
                <div className="flex items-center text-white text-sm font-medium">
                  <MapPin className="w-3 h-3 mr-1.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{ticket.event_location || 'TBD'}</span>
                </div>
              </div>
            </div>

            <Divider />

            {/* Ticket Type & User */}
            <div className="flex justify-between items-center bg-[var(--color-background)]/50 p-4 rounded-xl border border-[var(--color-border)]">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-secondary)]">Ticket Type</p>
                <p className="text-white font-semibold">{ticket.ticket_type_name ?? "General"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-secondary)]">Status</p>
                <p className={cn(
                  "font-semibold capitalize",
                  ticket.status === 'approved' || ticket.status === 'purchased' ? "text-emerald-400" : "text-[var(--color-secondary)]"
                )}>{ticket.status}</p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="bg-white p-4 rounded-2xl shadow-lg relative">
                {loading ? (
                  <div className="w-[180px] h-[180px] flex items-center justify-center text-slate-400 text-xs animate-pulse">
                    Generating...
                  </div>
                ) : (
                  qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR" className="w-[180px] h-[180px] object-contain" />
                  ) : (
                    <QRCode value={qrValue} size={180} />
                  )
                )}
              </div>
              <p className="mt-3 text-[10px] text-[var(--color-secondary)] uppercase tracking-widest">
                Scan at entrance
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleShare}
                disabled={sharing || shareSuccess}
                className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]/80 text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                variant="outline"
              >
                {shareSuccess ? (
                  <>
                    <Check className="w-4 h-4 mr-2" /> Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" /> {sharing ? "Sharing..." : "Share"}
                  </>
                )}
              </Button>
              <Button 
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" /> 
                {downloading ? "Downloading..." : "Save PDF"}
              </Button>
            </div>
            {error && (
              <div className="text-red-400 text-sm text-center mt-2">
                {error}
              </div>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}