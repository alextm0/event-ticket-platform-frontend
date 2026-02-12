"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { parseDateDMY } from "@/lib/utils";

interface DateFilterInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function DateFilterInput({ value, onChange, placeholder = "e.g. 2.7.2026", className }: DateFilterInputProps) {
    const [open, setOpen] = useState(false);
    const parsed = parseDateDMY(value);
    const selectedDate = parsed ?? undefined;

    const handleSelect = (date: Date | undefined) => {
        if (!date) return;
        onChange(format(date, "d.M.yyyy"));
        setOpen(false);
    };

    return (
        <div className={className ? `flex items-center gap-1 ${className}` : "flex items-center gap-1"}>
            <Input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-36 bg-black/20 border-white/10 text-white placeholder:text-slate-500"
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0 bg-black/20 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                        <CalendarIcon className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[var(--color-surface)] border-white/10" align="start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleSelect}
                        initialFocus
                        className="rounded-md border-0 text-white"
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
