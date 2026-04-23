import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create vehicles
  const vehicle1 = await prisma.vehicle.upsert({
    where: { plateNumber: "B1234XYZ" },
    update: {},
    create: { plateNumber: "B1234XYZ", type: "Truck Box" },
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: { plateNumber: "D5678ABC" },
    update: {},
    create: { plateNumber: "D5678ABC", type: "Truck Box" },
  });

  // Create admin user
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "Admin Operasional",
      username: "admin",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: Role.ADMIN,
    },
  });

  // Create driver users
  await prisma.user.upsert({
    where: { username: "driver1" },
    update: {},
    create: {
      name: "Budi Santoso",
      username: "driver1",
      passwordHash: await bcrypt.hash("driver123", 10),
      role: Role.DRIVER,
      vehicleId: vehicle1.id,
    },
  });

  await prisma.user.upsert({
    where: { username: "driver2" },
    update: {},
    create: {
      name: "Agus Wijaya",
      username: "driver2",
      passwordHash: await bcrypt.hash("driver123", 10),
      role: Role.DRIVER,
      vehicleId: vehicle2.id,
    },
  });

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
