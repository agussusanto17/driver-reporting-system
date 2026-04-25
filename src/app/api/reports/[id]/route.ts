import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { toAbsolutePath } from "@/lib/upload";

// GET /api/reports/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      vehicle: { select: { plateNumber: true } },
      photos: { select: { id: true, filePath: true, originalSize: true, compressedSize: true } },
    },
  });

  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Driver can only view their own reports
  if (session.user.role === "DRIVER" && report.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(report);
}

// DELETE /api/reports/[id] — admin only
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: { photos: { select: { filePath: true } } },
  });

  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Hapus file foto dari disk
  for (const photo of report.photos) {
    try {
      await unlink(toAbsolutePath(photo.filePath));
    } catch {
      // File sudah tidak ada, lanjutkan
    }
  }

  // Hapus dari database (cascade ke report_photos)
  await prisma.report.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
