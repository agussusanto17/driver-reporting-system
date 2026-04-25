import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/admin/admins
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      name: true,
      username: true,
      phone: true,
      email: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(admins);
}

// POST /api/admin/admins — create admin
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, username, password, phone, email } = await req.json();

  if (!name?.trim() || !username?.trim() || !password) {
    return NextResponse.json({ error: "Nama, username, dan password wajib diisi" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { username: username.trim() } });
  if (exists) return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });

  const hash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      name: name.trim(),
      username: username.trim(),
      passwordHash: hash,
      role: "ADMIN",
      phone: phone?.trim() || null,
      email: email?.trim() || null,
    },
    select: { id: true, name: true, username: true, phone: true, email: true, createdAt: true },
  });

  return NextResponse.json(admin, { status: 201 });
}
