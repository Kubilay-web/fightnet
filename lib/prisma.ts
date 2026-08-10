import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton.
 * Next.js dev modunda HMR her modül yenilemesinde yeni client üretir ve
 * MongoDB bağlantı havuzunu tüketir. globalThis üzerinde tutarak tek
 * bağlantı havuzu ile en hızlı sorgu yolunu koruyoruz.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
