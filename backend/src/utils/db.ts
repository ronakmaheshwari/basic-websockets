import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!, // Required
});

declare global {
  var prisma: PrismaClient | undefined;
}

export const db =
  global.prisma ??
  new PrismaClient({
    log: ["query", "warn", "error"],
    adapter, 
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}

export default db;