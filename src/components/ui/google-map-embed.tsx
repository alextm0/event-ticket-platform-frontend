"use client";

import { MapPin } from "lucide-react";

interface GoogleMapEmbedProps {
    location: string;
    className?: string;
}

export function GoogleMapEmbed({ location, className = "" }: GoogleMapEmbedProps) {
    // Determine if we have a valid location to search
    const encodedLocation = encodeURIComponent(location);

    // Using the standard embed iframe which works without an API key for basic place searches
    const mapSrc = `https://maps.google.com/maps?q=${encodedLocation}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

    return (
        <div className={`relative w-full h-full min-h-[300px] rounded-[var(--radius-xl)] overflow-hidden bg-[var(--color-surface)] border border-white/5 ${className}`}>
            {location ? (
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0, minHeight: "300px" }}
                    src={mapSrc}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale hover:grayscale-0 transition-all duration-500 opacity-80 hover:opacity-100"
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-black/40">
                    <MapPin className="w-8 h-8 mb-2 opacity-50" />
                    <p>Location not specified</p>
                </div>
            )}
        </div>
    );
}
