import { PrismaClient } from "@prisma/client";
export const db = global.prisma ??
    new PrismaClient({
        log: ["query", "warn", "error"],
    });
if (process.env.NODE_ENV !== "production")
    global.prisma = db;
export default db;
//# sourceMappingURL=db.js.map