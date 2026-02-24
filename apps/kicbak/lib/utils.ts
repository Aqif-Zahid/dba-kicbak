import type { AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn/ui helper */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Unified API error message extractor: { status, message } */
export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong"
) => {
  if (!error) return fallback;

  const ax = error as AxiosError<any>;
  const msg =
    ax?.response?.data?.message ??
    ax?.message ??
    (typeof error === "string" ? error : null);

  return msg || fallback;
};

/** Used in UI for readable counts */
export function formatNumber(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
  } catch {
    return String(n);
  }
}

/**
 * Relative date formatter used across post cards (e.g. "2h ago", "3d ago").
 * Accepts Date, ISO string, or timestamp.
 */
export function formatRelativeDate(input: string | number | Date) {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";

  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  // Future dates
  if (diffSec < 0) return "just now";

  if (diffSec < 60) return "just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  // Fallback to a readable date
  try {
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}
