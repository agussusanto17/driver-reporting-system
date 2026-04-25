import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SELECT = {
  id: true, name: true, username: true, phone: true, email: true, createdAt: true,
};

// PATCH /api/admin/admins/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { name, username, password, phone, email } = await req.json();
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

  const admin = await prisma.user.update({ where: { id }, data, select: SELECT });
  return NextResponse.json(admin);
}

// DELETE /api/admin/admins/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
