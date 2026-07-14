import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * True for the sentinel rejection Next.js throws when a dynamic API (cookies(),
 * fetch(), etc.) is accessed after a build-time prerender pass has finished.
 * This is expected bailout-to-dynamic signaling, not an application error — it
 * must be rethrown so Next can handle it, never logged or swallowed.
 */
export function isPrerenderBailout(error: unknown): boolean {
  return (error as { digest?: string } | undefined)?.digest === 'HANGING_PROMISE_REJECTION';
}
