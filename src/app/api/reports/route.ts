import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureUploadDir, generateFileName, toRelativePath } from "@/lib/upload";
import { writeFile } from "fs/promises";
import path from "path";

// GET /api/reports — list reports
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const plateNumber = searchParams.get("plateNumber");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const reportType = searchParams.get("reportType");
  const driverId = searchParams.get("driverId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = {};

  // Drivers can only see their own reports
  if (session.user.role === "DRIVER") {
    where.userId = session.user.id;
  }

  // Filters
  if (plateNumber) {
    where.vehicle = { plateNumber: { contains: plateNumber } };
  }
  if (reportType) {
    where.reportType = reportType;
  }
  if (driverId) {
    where.userId = driverId;
  }
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate + "T23:59:59.999Z");
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        vehicle: { select: { plateNumber: true } },
        photos: { select: { id: true, filePath: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return NextResponse.json({ reports, total, page, limit });
}

// POST /api/reports — create report
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DRIVER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const reportType = formData.get("reportType") as string;
    const originCity = formData.get("originCity") as string;
    const destinationCity = formData.get("destinationCity") as string;
    const vehicleId = formData.get("vehicleId") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    const locationName = formData.get("locationName") as string;
    const accuracy = parseFloat(formData.get("accuracy") as string);
    const notes = formData.get("notes") as string | null;
    const photos = formData.getAll("photos") as File[];

    // Validate required fields
    if (!reportType || !originCity || !destinationCity || !vehicleId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!latitude || !longitude) {
      return NextResponse.json({ error: "GPS location is required" }, { status: 400 });
    }
    if (!photos.length) {
      return NextResponse.json({ error: "At least 1 photo is required" }, { status: 400 });
    }
    if (photos.length > 5) {
      return NextResponse.json({ error: "Maximum 5 photos allowed" }, { status: 400 });
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        userId: session.user.id,
        vehicleId,
        reportType: reportType as any,
        originCity,
        destinationCity,
        latitude,
        longitude,
        locationName,
        accuracy: accuracy || null,
        notes: notes || null,
      },
    });

    // Save photos to disk
    const uploadDir = await ensureUploadDir();
    const photoRecords = [];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const fileName = generateFileName(report.id, i);
      const filePath = path.join(uploadDir, fileName);

      const buffer = Buffer.from(await photo.arrayBuffer());
      await writeFile(filePath, buffer);

      photoRecords.push({
        reportId: report.id,
        filePath: toRelativePath(filePath),
        originalSize: photo.size,
        compressedSize: buffer.length,
      });
    }

    // Save photo metadata to DB
    await prisma.reportPhoto.createMany({ data: photoRecords });

    const fullReport = await prisma.report.findUnique({
      where: { id: report.id },
      include: {
        user: { select: { name: true } },
        vehicle: { select: { plateNumber: true } },
        photos: true,
      },
    });

    return NextResponse.json(fullReport, { status: 201 });
  } catch (error) {
    console.error("Create report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
