import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssignedEvent } from "@/types";

interface EventSelectorProps {
    events: AssignedEvent[];
    selectedEventId: string;
    onSelectEvent: (eventId: string) => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
}

export function EventSelector({
    events,
    selectedEventId,
    onSelectEvent,
    isFullscreen,
    onToggleFullscreen
}: EventSelectorProps) {
    return (
        <div className={cn(
            "flex flex-col gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl animate-in fade-in duration-700",
            isFullscreen && "mx-4 order-last"
        )}>
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <Select value={selectedEventId} onValueChange={onSelectEvent}>
                        <SelectTrigger className="h-10 border-white/10 bg-black/40 text-white rounded-lg">
                            <SelectValue placeholder="Select Event" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-[#1a1d23] text-white">
                            {events.map((event) => (
                                <SelectItem key={event.eventId} value={event.eventId}>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {event.eventName}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {isFullscreen && (
                    <Button
                        onClick={onToggleFullscreen}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-white/10 bg-white/5 text-slate-400"
                    >
                        <Minimize2 className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </div>
    );
}
