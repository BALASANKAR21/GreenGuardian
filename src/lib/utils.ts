import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge conditional class names with Tailwind conflict resolution.
 * - Accepts any clsx-compatible values.
 * - Ensures consistent whitespace by trimming the result.
 */
export function cn(...inputs: ClassValue[]): string {
  if (inputs.length === 0) return ""
  return twMerge(clsx(...inputs)).trim()
}
