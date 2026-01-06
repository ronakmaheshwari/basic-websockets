import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config();
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prismaClient = global.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development"
            ? ["query", "warn", "error"]
            : ["error"],
        adapter,
    });
if (process.env.NODE_ENV !== "production") {
    global.prisma = prismaClient;
}
const db = prismaClient;
export default db;
export { db };
