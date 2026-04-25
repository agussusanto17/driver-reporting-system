import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: {
        // Limit connection pool untuk shared hosting
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });
}

// Singleton pattern — satu client per process
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
