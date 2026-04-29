import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Vehicles
  const vehicleData = [
    { plateNumber: "B9819BXT", type: "CDE" },
    { plateNumber: "B9658BXU", type: "CDE" },
    { plateNumber: "B9060KXW", type: "CDE" },
    { plateNumber: "B9201BXU", type: "CDE" },
    { plateNumber: "B9203BXU", type: "CDE" },
    { plateNumber: "B9713BXU", type: "CDE" },
    { plateNumber: "B9059KXW", type: "CDE" },
    { plateNumber: "B9058KXW", type: "CDE" },
    { plateNumber: "B9864BXT", type: "CDE" },
    { plateNumber: "B9954BXT", type: "CDE" },
    { plateNumber: "B9970BXT", type: "CDE" },
    { plateNumber: "B9322PXW", type: "CDD LONG" },
    { plateNumber: "B9067UXY", type: "TRAGA" },
    { plateNumber: "B9259UXY", type: "TRAGA" },
    { plateNumber: "B9346UXY", type: "TRAGA" },
    { plateNumber: "B9380UXY", type: "TRAGA" },
    { plateNumber: "B9424UXY", type: "TRAGA" },
    { plateNumber: "B9463UXY", type: "TRAGA" },
    { plateNumber: "B9484UXX", type: "TRAGA" },
    { plateNumber: "B9521UXY", type: "TRAGA" },
    { plateNumber: "B9655UXX", type: "TRAGA" },
    { plateNumber: "B9675UXX", type: "TRAGA" },
    { plateNumber: "B9681UXX", type: "TRAGA" },
    { plateNumber: "B9482UXX", type: "TRAGA" },
    { plateNumber: "B9686UXY", type: "TRAGA" },
    { plateNumber: "B9695UXY", type: "TRAGA" },
    { plateNumber: "B9809UXX", type: "TRAGA" },
  ];

  const vehicles: Record<string, string> = {};
  for (const v of vehicleData) {
    const vehicle = await prisma.vehicle.upsert({
      where: { plateNumber: v.plateNumber },
      update: {},
      create: v,
    });
    vehicles[v.plateNumber] = vehicle.id;
  }

  // Admins — password = no HP tanpa tanda hubung
  const adminData = [
    { name: "Destari",       username: "destari",     phone: "082297601784" },
    { name: "Muhamad Dias",  username: "muhamaddias", phone: "085811098154" },
    { name: "Riandi",        username: "riandi",      phone: "085157735191" },
    { name: "Imas",          username: "imas",        phone: "085221073725" },
  ];

  for (const a of adminData) {
    await prisma.user.upsert({
      where: { username: a.username },
      update: {},
      create: {
        name: a.name,
        username: a.username,
        passwordHash: await bcrypt.hash(a.phone, 10),
        role: Role.ADMIN,
        phone: a.phone,
      },
    });
  }

  // Drivers — password = no HP tanpa tanda hubung
  const driverData = [
    { name: "Fadli",               username: "fadli",           phone: "089630057977",  plateNumber: "B9819BXT" },
    { name: "Ikhsan",              username: "ikhsan",          phone: "085722149651",  plateNumber: "B9658BXU" },
    { name: "Jajang",              username: "jajang",          phone: "085891261719",  plateNumber: "B9060KXW" },
    { name: "Gilang",              username: "gilang",          phone: "085860386578",  plateNumber: "B9201BXU" },
    { name: "Jeni",                username: "jeni",            phone: "083197359121",  plateNumber: "B9203BXU" },
    { name: "Wilman",              username: "wilman",          phone: "085656635274",  plateNumber: "B9713BXU" },
    { name: "Yudi",                username: "yudi",            phone: "082120835445",  plateNumber: "B9059KXW" },
    { name: "Eka",                 username: "eka",             phone: "085693132859",  plateNumber: "B9058KXW" },
    { name: "Hasan",               username: "hasan",           phone: "081522886187",  plateNumber: "B9864BXT" },
    { name: "Abu S",               username: "abus",            phone: "082297887009",  plateNumber: "B9954BXT" },
    { name: "Yodi",                username: "yodi",            phone: "0895379709050", plateNumber: "B9970BXT" },
    { name: "Krisandi",            username: "krisandi",        phone: "081221113830",  plateNumber: "B9322PXW" },
    { name: "Darma",               username: "darma",           phone: "085893102285",  plateNumber: "B9259UXY" },
    { name: "Aditya",              username: "aditya",          phone: "08979647621",   plateNumber: "B9346UXY" },
    { name: "Agus Sumanjaya",      username: "agussumanjaya",   phone: "082121334944",  plateNumber: "B9380UXY" },
    { name: "Hendra Setiawan",     username: "hendrasetiawan",  phone: "081293102385",  plateNumber: "B9424UXY" },
    { name: "Ahmad Fauzi",         username: "ahmadfauzi",      phone: "089605374583",  plateNumber: "B9463UXY" },
    { name: "Irfan Dadi",          username: "irfandadi",       phone: "081381018958",  plateNumber: "B9484UXX" },
    { name: "Wahyu Kurniawan",     username: "wahyukurniawan",  phone: "087730020992",  plateNumber: "B9521UXY" },
    { name: "Agung Budi Susilo",   username: "agungbudisusilo", phone: "081290003577",  plateNumber: "B9655UXX" },
    { name: "Armial Dani Ginting", username: "armial",          phone: "081389847856",  plateNumber: "B9675UXX" },
    { name: "Arman",               username: "arman",           phone: "085722196356",  plateNumber: "B9681UXX" },
    { name: "Rafli Novrian",       username: "raflinovrian",    phone: "089509178924",  plateNumber: "B9482UXX" },
    { name: "Indra",               username: "indra",           phone: "0895803175789", plateNumber: "B9686UXY" },
    { name: "Deden",               username: "deden",           phone: "082125608116",  plateNumber: "B9695UXY" },
    { name: "Abdul Rohim",         username: "abdulrohim",      phone: "083183992739",  plateNumber: "B9809UXX" },
  ];

  for (const d of driverData) {
    await prisma.user.upsert({
      where: { username: d.username },
      update: {},
      create: {
        name: d.name,
        username: d.username,
        passwordHash: await bcrypt.hash(d.phone, 10),
        role: Role.DRIVER,
        phone: d.phone,
        vehicleId: vehicles[d.plateNumber],
      },
    });
  }

  console.log("✅ Seed completed: 27 kendaraan, 26 driver, 4 admin");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
