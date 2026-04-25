import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SELECT = {
  id: true, name: true, username: true, phone: true, email: true,
  vehicleId: true,
  vehicle: { select: { id: true, plateNumber: true, type: true } },
  createdAt: true,
  _count: { select: { reports: true } },
};

// PATCH /api/admin/drivers/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { name, username, password, phone, email, vehicleId } = await req.json();

  const data: Record<string, unknown> = {};

  if (name !== undefined) {
    if (!name.trim()) return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });
    data.name = name.trim();
  }
  if (username !== undefined) {
    if (!username.trim()) return NextResponse.json({ error: "Username tidak boleh kosong" }, { status: 400 });
    const taken = await prisma.user.findFirst({ where: { username: username.trim(), NOT: { id } } });
    if (taken) return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
    data.username = username.trim();
  }
  if (password) {
    if (password.length < 6) return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    data.passwordHash = await bcrypt.hash(password, 10);
  }
  if (phone !== undefined) data.phone = phone?.trim() || null;
  if (email !== undefined) data.email = email?.trim() || null;
  if (vehicleId !== undefined) data.vehicleId = vehicleId || null;

  const driver = await prisma.user.update({ where: { id }, data, select: SELECT });
  return NextResponse.json(driver);
}

// DELETE /api/admin/drivers/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const count = await prisma.report.count({ where: { userId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: `Driver memiliki ${count} laporan. Hapus laporan terlebih dahulu.` },
      { status: 400 }
    );
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
