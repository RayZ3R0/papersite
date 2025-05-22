import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get the current base URL (works in both client and server contexts)
export function getCurrentBaseUrl() {
  // In browser, use the current origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // In server context, use the env var
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function formatPrice(price: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(typeof price === "string" ? parseFloat(price) : price);
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

// Add more utility functions as needed
