import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes a filename by replacing unsafe characters with underscores
 * @param filename - The original filename
 * @returns The sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, "_");
}

/**
 * Generates a unique file key for R2 storage
 * @param options - Configuration options
 * @param options.filename - The original filename
 * @param options.userId - The user ID
 * @param options.pathPrefix - Optional path prefix (defaults to "uploads")
 * @returns A unique file key in the format: pathPrefix/userId/timestamp-uuid-sanitizedFilename
 */
export function generateFileKey({
  filename,
  userId,
  pathPrefix = "uploads",
}: {
  filename: string;
  userId: string;
  pathPrefix?: string;
}): string {
  const timestamp = Date.now();
  const randomId = crypto.randomUUID();
  const sanitizedName = sanitizeFilename(filename);
  return `${pathPrefix}/${userId}/${timestamp}-${randomId}-${sanitizedName}`;
}
