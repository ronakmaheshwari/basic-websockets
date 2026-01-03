import { type Prisma, PrismaClient } from "@prisma/client";
declare global {
    var prisma: PrismaClient | undefined;
}
export declare const db: PrismaClient<Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/client").DefaultArgs>;
export default db;
//# sourceMappingURL=db.d.ts.map