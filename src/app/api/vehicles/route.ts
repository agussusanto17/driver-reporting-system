import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/vehicles
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true" && session.user.role === "ADMIN";

  const vehicles = await prisma.vehicle.findMany({
    where: all ? undefined : { isActive: true },
    select: {
      id: true,
      plateNumber: true,
      type: true,
      isActive: true,
      createdAt: true,
      users: { select: { id: true, name: true } },
    },
    orderBy: [{ isActive: "desc" }, { plateNumber: "asc" }],
  });

  return NextResponse.json(vehicles);
}

// POST /api/vehicles — create (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plateNumber, type } = await req.json();

  if (!plateNumber?.trim() || !type?.trim()) {
    return NextResponse.json({ error: "Nopol dan tipe wajib diisi" }, { status: 400 });
  }

  const exists = await prisma.vehicle.findUnique({ where: { plateNumber: plateNumber.trim().toUpperCase() } });
  if (exists) return NextResponse.json({ error: "Nopol sudah terdaftar" }, { status: 400 });

  const vehicle = await prisma.vehicle.create({
    data: { plateNumber: plateNumber.trim().toUpperCase(), type: type.trim() },
    select: { id: true, plateNumber: true, type: true, isActive: true, createdAt: true, users: { select: { id: true, name: true } } },
  });

  return NextResponse.json(vehicle, { status: 201 });
}
