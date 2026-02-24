"use client";

import * as React from "react";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  label: string;
  minDate?: Date;
}

export function DateTimePicker({ date, setDate, label, minDate }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);
  const [hours, setHours] = useState<string>(date ? format(date, "HH") : "12");
  const [minutes, setMinutes] = useState<string>(date ? format(date, "mm") : "00");

  // Sync internal state from date prop when it changes (e.g. external reset)
  React.useEffect(() => {
    setSelectedDate(date);
    setHours(date ? format(date, "HH") : "12");
    setMinutes(date ? format(date, "mm") : "00");
  }, [date]);

  // Push changes to parent; skip when reconstructed value equals prop (avoids mount and sync no-ops)
  React.useEffect(() => {
    const reconstructed = selectedDate
      ? (() => {
          const d = new Date(selectedDate);
          d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
          return d;
        })()
      : undefined;

    const propTime = date?.getTime() ?? null;
    const reconTime = reconstructed?.getTime() ?? null;
    if (propTime === reconTime) return;

    setDate(reconstructed);
  }, [selectedDate, hours, minutes, date, setDate]);

  const disabledDays = minDate
    ? { before: new Date(new Date(minDate).setHours(0, 0, 0, 0)) }
    : undefined;

  return (
    <div className="space-y-2">
      <Label className="text-slate-300 font-medium">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            type="button"
            className={cn(
              "w-full h-11 justify-start text-left font-normal bg-[var(--color-background)] border-[var(--color-border)] hover:bg-[var(--color-background)]/80 hover:text-white transition-all rounded-xl",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-[var(--color-primary)] opacity-70" />
            {date ? (
              format(date, "PPP p")
            ) : (
              <span className="text-slate-500">Pick a date and time</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[320px] p-0 bg-[var(--color-surface)] border-[var(--color-border)] shadow-2xl rounded-2xl overflow-hidden"
          align="start"
        >
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between gap-4 bg-[var(--color-background)]/50">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="text-sm font-semibold text-white">Time</span>
            </div>
            <div className="flex items-center gap-2">
              <Select value={hours} onValueChange={setHours}>
                <SelectTrigger className="w-[75px] h-9 bg-[var(--color-background)] border-[var(--color-border)] focus:ring-1 focus:ring-[var(--color-primary)]/30 rounded-lg">
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)] max-h-60">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                      {i.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-white font-bold">:</span>
              <Select value={minutes} onValueChange={setMinutes}>
                <SelectTrigger className="w-[75px] h-9 bg-[var(--color-background)] border-[var(--color-border)] focus:ring-1 focus:ring-[var(--color-primary)]/30 rounded-lg">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
                  {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(
                    (m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={disabledDays}
            initialFocus
            className="p-3 bg-transparent text-white"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
