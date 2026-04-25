import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/vehicles/[id] — update plateNumber, type, isActive
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { plateNumber, type, isActive } = body;

  const data: Record<string, unknown> = {};
  if (plateNumber !== undefined) {
    if (!plateNumber.trim()) return NextResponse.json({ error: "Nopol tidak boleh kosong" }, { status: 400 });
    const exists = await prisma.vehicle.findFirst({
      where: { plateNumber: plateNumber.trim().toUpperCase(), NOT: { id } },
    });
    if (exists) return NextResponse.json({ error: "Nopol sudah digunakan kendaraan lain" }, { status: 400 });
    data.plateNumber = plateNumber.trim().toUpperCase();
  }
  if (type !== undefined) data.type = type.trim();
  if (isActive !== undefined) data.isActive = isActive;

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data,
    select: { id: true, plateNumber: true, type: true, isActive: true, createdAt: true, users: { select: { id: true, name: true } } },
  });

  return NextResponse.json(vehicle);
}
