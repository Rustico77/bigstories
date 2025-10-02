// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // éviter de recréer le client à chaque hot reload en dev
  // (sinon ça peut saturer ta BDD)
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({});

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
