import { MapPin } from "lucide-react";
import { GoogleMapEmbed } from "@/components/ui/google-map-embed";
import type { PublishedEvent } from "@/types";

interface OverviewTabProps {
  event: PublishedEvent;
}

export function OverviewTab({ event }: OverviewTabProps) {
  const startDate = new Date(event.startTime);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Description */}
      <section className="space-y-4">
        <h3 className="text-2xl font-bold text-white">About this Event</h3>
        <div className="prose prose-invert prose-lg max-w-none text-slate-300">
          <p className="whitespace-pre-wrap">{event.description}</p>
        </div>
      </section>

      {/* Host Info */}
      <section className="flex items-center gap-4 bg-[var(--color-surface)]/50 p-6 rounded-xl border border-white/5">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-black/20">
          {event.organizerName?.charAt(0) ?? "O"}
        </div>
        <div>
          <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">
            Hosted by
          </p>
          <p className="text-white font-bold text-lg">
            {event.organizerName ?? "Event Organizer"}
          </p>
        </div>
      </section>

      {/* Location (Map) */}
      <section className="space-y-6">
        <h3 className="text-2xl font-bold text-white">Location</h3>

        <div className="bg-[var(--color-surface)] rounded-2xl p-1 border border-white/10 shadow-xl overflow-hidden">
          <div className="bg-[var(--color-background)]/50 px-6 py-4 border-b border-white/5 flex items-start gap-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
              <MapPin className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg leading-tight">
                {event.location}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  event.location,
                )}`}
                target="_blank"
                rel="noreferrer noopener"
                className="text-emerald-400 hover:text-emerald-300 text-sm mt-1 inline-block"
              >
                Get Directions &rarr;
              </a>
            </div>
          </div>
          <div className="h-[400px] w-full relative grayscale-[50%] hover:grayscale-0 transition-all duration-500">
            <GoogleMapEmbed location={event.location} className="h-full w-full" />
          </div>
        </div>
      </section>
    </div>
  );
}

