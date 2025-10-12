import { clsx, type ClassValue } from "clsx";
import { formatDate, formatDistanceToNowStrict } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getErrorMessage = (err: unknown): string => {
  // First, check if `err` is an object and not null
  if (typeof err === "object" && err !== null) {
    // Now, narrow the type of `err` by checking for the `errors` property
    if ("errors" in err) {
      const errors = (err as { errors?: Record<string, string[]> }).errors;
      if (errors) {
        return Object.values(errors)[0][0] || "An unknown error occurred";
      }
    }

    // Check if `err` has a `message` property
    if ("message" in err) {
      const message = (err as { message?: string | Record<string, string[]> })
        .message;

      if (typeof message === "object" && message !== null) {
        return Object.values(message)[0][0] || "An unknown error occurred";
      }

      if (typeof message === "string") {
        return message;
      }
    }
  }
  // If `err` doesn't have the expected structure, return a default message
  return "An unknown error occurred";
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
