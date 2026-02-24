import { clsx, type ClassValue } from "clsx";
import { formatDate, formatDistanceToNowStrict } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getErrorMessage = (err: unknown): string => {
  try {
    if (!err) return "An unknown error occurred";

    // Handle Axios-style wrapped errors
    const e = (err as any)?.response?.data ?? err;

    // Handle Zod errors returned as array
    if (Array.isArray(e)) {
      const firstError = e[0];
      if (firstError?.message) return firstError.message;
    }

    // Handle Zod errors returned as object with fieldErrors
    if (e.errors && typeof e.errors === "object") {
      const firstField = Object.values(e.errors)[0];
      if (Array.isArray(firstField)) return firstField[0];
    }

    // Handle case where backend sends structured Zod error as stringified JSON
    if (typeof e.message === "string") {
      try {
        const parsed = JSON.parse(e.message);
        if (Array.isArray(parsed) && parsed[0]?.message) {
          return parsed[0].message;
        }
      } catch {
        // not JSON, just return it directly
      }
      return e.message;
    }

    // Handle deeply nested message
    if (e.response?.data?.message) return e.response.data.message;

    return "An unknown error occurred";
  } catch {
    return "Unexpected error occurred";
  }
};


export const formatNumber = (n: number): string => {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
};

export const formatRelativeDate = (from: Date) => {
  const currentDate = new Date();
  const date = typeof from === "string" ? new Date(from) : from;
  const timeDiff = currentDate.getTime() - date.getTime();
  if (timeDiff < 24 * 60 * 60 * 1000) {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } else {
    if (currentDate.getFullYear() == date.getFullYear()) {
      return formatDate(date, "MMM d");
    } else {
      return formatDate(date, "MMM d, yyyy");
    }
  }
};

export const slugify = (s: string): string => {
  return s
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-zA-Z0-9]/g, "");
};
