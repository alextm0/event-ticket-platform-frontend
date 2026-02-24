import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parse } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse a date string in `d.M.yyyy` or `d/M/yyyy` format into a Date.
 * Returns null if the value is empty or cannot be parsed.
 */
export function parseDateDMY(value: string): Date | null {
  if (!value?.trim()) return null;
  const normalized = value.trim().replace(/\//g, ".");
  try {
    const d = parse(normalized, "d.M.yyyy", new Date());
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}
