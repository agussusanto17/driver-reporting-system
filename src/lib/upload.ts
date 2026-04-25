import { mkdir } from "fs/promises";
import path from "path";

// UPLOADS_ROOT is set by server.js at startup to an absolute path.
// Fallback to process.cwd() for local dev.
const UPLOADS_ROOT = process.env.UPLOADS_ROOT ?? path.join(process.cwd(), "uploads");

export function getUploadDir(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return path.join(UPLOADS_ROOT, String(year), month, day);
}

export async function ensureUploadDir(): Promise<string> {
  const dir = getUploadDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

function sanitize(str: string): string {
  return str.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function generateFileName(
  index: number,
  plateNumber: string,
  originCity: string,
  destinationCity: string,
): string {
  const name = `${sanitize(plateNumber)}-${sanitize(originCity)}-${sanitize(destinationCity)}`;
  return `${name}-${index}-${Date.now()}.jpg`;
}

// Strip UPLOADS_ROOT prefix to get a storable relative path
export function toRelativePath(absolutePath: string): string {
  return absolutePath.replace(UPLOADS_ROOT, "").replace(/\\/g, "/");
}

// Reconstruct absolute path from stored relative path
export function toAbsolutePath(relativePath: string): string {
  return path.join(UPLOADS_ROOT, relativePath);
}
