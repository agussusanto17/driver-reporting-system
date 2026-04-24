import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { toAbsolutePath } from "@/lib/upload";
import path from "path";

// GET /api/uploads/[...path] — serve uploaded files
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const relativePath = pathSegments.join("/");
    const filePath = toAbsolutePath(relativePath);

    // Security: prevent directory traversal
    const uploadsRoot = toAbsolutePath("");
    if (!path.resolve(filePath).startsWith(path.resolve(uploadsRoot))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const file = await readFile(filePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
