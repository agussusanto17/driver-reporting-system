import { mkdir } from "fs/promises";
import path from "path";

/**
 * Get upload directory path organized by date
 * /uploads/2026/04/23/
 */
export function getUploadDir(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return path.join(process.cwd(), "uploads", String(year), month, day);
}

/**
 * Ensure upload directory exists
 */
export async function ensureUploadDir(): Promise<string> {
  const dir = getUploadDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

/**
 * Generate unique filename
 */
export function generateFileName(reportId: string, index: number): string {
  const timestamp = Date.now();
  return `${reportId}-${index}-${timestamp}.jpg`;
}

/**
 * Get public URL path for a stored file
 */
export function getFileUrl(filePath: string): string {
  // Convert absolute path to relative URL
  const relative = filePath.replace(process.cwd(), "").replace(/\\/g, "/");
  return `/api/uploads${relative}`;
}
