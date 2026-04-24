import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// PATCH /api/profile — update name, phone, email
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, phone, email } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
    },
    select: { id: true, name: true, phone: true, email: true },
  });

  return NextResponse.json(updated);
}
