import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/vehicles — list active vehicles (for driver vehicle picker)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vehicles = await prisma.vehicle.findMany({
    where: { isActive: true },
    select: { id: true, plateNumber: true, type: true },
    orderBy: { plateNumber: "asc" },
  });

  return NextResponse.json(vehicles);
}
